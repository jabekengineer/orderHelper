/**
 * The working class for everything in the workflow
 */ 
class orderDetails{
    constructor(){
      this.messageDate = null;
      this.isOrder = false;
      this.id = null;
      this.orderNumber = null;
      this.matched = false;
      this.membership = false;
      this.choreographer = null;
      this.classDate = null;
      this.customerName = null;
      this.customerEmail = null;
      this.groupNumber = null;
      this.link = null;
      this.sendLabel = null;
    }
  }

/**
 * Find squarespace transaction that matches number in email header
 * @param order {orderDetails} - orderNumber, messageDate -> matched, parseProductInfo(order)
 * @returns order
 */
function matchOrder(order){
    if(!order.orderNumber){
      order.matched = false;
      return order
    }
    let sq = new SquareSpace();
    const notificationDate = order.messageDate;
    let tomorrow = Utilities.formatDate(new Date(new Date().setDate(notificationDate.getDate() + 50)),"GMT-4", "yyyy-MM-dd") + "T12:00:00Z";
    let yesterday = Utilities.formatDate(new Date(new Date().setDate(notificationDate.getDate() - 50)),"GMT-4", "yyyy-MM-dd") + "T12:00:00Z";
    let result = sq.get("orders?modifiedAfter=" + yesterday + "&modifiedBefore=" + tomorrow)
    let orders = result.result;
    orders.forEach(function(_order){
      if(order.orderNumber.indexOf(_order.orderNumber) != -1){
        order.matched = true;
        parseProductInfo(order, _order.lineItems[0]["productName"],_order)
        return order
      }
    })
    return order
}
/**
 * With matching transaction, 
 */
function parseProductInfo(order, productName, _order) { 
  order.id = _order.id
  // standard membership
  if(productName.indexOf('Standard Membership')!=-1){
    order.membership = true;
    order.customerName = 'Standard Membership'
    order.choreographer = 'Standard Membership'
    order.classDate = 'Standard! Membership!'
    return order
  }
  order.customerName = [_order.billingAddress.firstName, _order.billingAddress.lastName].join(' ');
  order.customerEmail = _order.customerEmail;
  try{
    order.choreographer = ((productName.replace(/[0-9]/g, '')).replace(/[,.]/g,'')).trim();
    var classDate = productName.replace(/[a-z]/g, '').trim();
    classDate = classDate.replace(/[A-Z]/g,'');
    order.classDate = classDate;
    var customizations = _order.lineItems[0]["customizations"];
    customizations.forEach(function(formField){
      if(formField.label == "Group Number"){
        var groupNumber = formField.value.replace(/[a-z]/g, '').trim();
        groupNumber = groupNumber.replace(/[A-Z]/g, '');
        order.groupNumber = groupNumber;
      }
    })
    return order
  }
  catch {
    order.choreographer = productName;
    order.classDate = productName;
    return order
  } 
}

/**
 * Called by onMessage to contain order parsing visuals 
 * @param {orderDetails} The order defined in backend
 * @returns {CardService.Card} User visuals for parsing order notification email
*/
function createOrderParseCard(order) {
  if(!order.isOrder){
    let cardHeader = CardService.newCardHeader()
        .setTitle('Not a Squarespace Order')
        .setSubtitle("I won't take any action here.")
        .setImageStyle(CardService.ImageStyle.CIRCLE)
        .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/sbk_logo.png?v=1679585187942");
    var image = CardService.newImage()
      .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/caveGuy.jpg?v=1679588552977")
      .setAltText('Castle in the Sky Cave Guy')
    var imageSection = CardService.newCardSection()
      .addWidget(image)
    var card = CardService.newCardBuilder()
      .setHeader(cardHeader)
      .addSection(imageSection)
      return card
  }

  if(!order.matched){
    let cardHeader = CardService.newCardHeader()
        .setTitle('No Matching Squarespace Order Found')
        .setImageStyle(CardService.ImageStyle.CIRCLE)
        .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/sbk_logo.png?v=1679585187942");
    var image = CardService.newImage()
      .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/trumpet.jpg?v=1679591368496")
      .setAltText('Castle in the Sky Trumpet')
    var imageSection = CardService.newCardSection()
      .addWidget(image)
    var textParagraph = CardService.newTextParagraph()
        .setText(JSON.stringify(order,null, 4))
    var textSection = CardService.newCardSection()
      .addWidget(textParagraph)
    var card = CardService.newCardBuilder()
      .setHeader(cardHeader)
      .addSection(imageSection)
      .addSection(textSection)
      return card
  }

  if(order.membership){
    let cardHeader = CardService.newCardHeader()
        .setTitle('Standard Membership Order')
        .setSubtitle("I won't take any action here.")
        .setImageStyle(CardService.ImageStyle.CIRCLE)
        .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/sbk_logo.png?v=1679585187942");
    var image = CardService.newImage()
      .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/caveGuy.jpg?v=1679588552977")
      .setAltText('Castle in the Sky Cave Guy')
    var imageSection = CardService.newCardSection()
      .addWidget(image)
    var card = CardService.newCardBuilder()
      .setHeader(cardHeader)
      .addSection(imageSection)
      return card
  }
    
    var textParagraph = CardService.newTextParagraph()
        .setText("Customer Name | " + order.customerName + ' \n' +
            "Product Order | " + order.choreographer.trim() + " " + order.classDate.trim() + '\n' +
            "Sq. ID | " + order.id + '\n' + 
            "Customer Email | " + order.customerEmail)
    var orderParseSection = CardService.newCardSection()
      .setHeader(order.customerName + " Footage Order")
      .addWidget(textParagraph)

    console.log('give me something')
    return orderParseSection
}
