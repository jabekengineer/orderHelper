/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomepage(e) {

    var cardHeader = CardService.newCardHeader()
      .setTitle("PKM Order Helper Welcomes You")
      .setSubtitle("Open an email and I'll get started.")
      .setImageStyle(CardService.ImageStyle.CIRCLE)
      .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/sbk_logo.png?v=1679585187942");
  
     var image = CardService.newImage()
      .setImageUrl('https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/robot.jpg?v=1679586590335')
      .setAltText('Castle in the Sky Robot Line Drawing')
       // Assemble the widgets and return the card.
    var imageSection = CardService.newCardSection()
        .addWidget(image)
    var card = CardService.newCardBuilder()
        .setHeader(cardHeader)
        .addSection(imageSection)
    return card.build()
  }
  
  /**
   * Callback on gmail message.
   * @param {Object} e The event object.
   * @return {CardService.Card} The card to show to the user.
   */
  function onGmailMessage(e) {
    // Get the ID of the message the user has open.
    var messageId = e.gmail.messageId;
  
    // Get an access token scoped to the current message and use it for GmailApp
    // calls.
    var accessToken = e.gmail.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
  
    // Get the subject of the email.
    var message = GmailApp.getMessageById(messageId);
    var subject = message.getThread().getFirstMessageSubject();
    var order = new orderDetails();
    order.messageDate = message.getDate()
  
    // the card which will be dynamically build
    var card = null;
    
  
    // if its not an order email there is nothing to do
    if(subject.indexOf('PandaKo Media: A New Order has Arrived') == -1){
      order.isOrder = false;
      card = createOrderParseCard(order)
      return card.build()
      }
      order.isOrder = true;
      // get everything between parentheses
      let id_one = (subject.split('(')[1]).split(')')[0]
      // strip everything from non-numeric
      let id_two = subject.replace(/\D/g,'');
      // compare the two results
      if(Number(id_one) == Number(id_two)){
        order.orderNumber = id_two;
      }
      matchOrder(order)
      if(!order.matched){
        card = createOrderParseCard(order);
        return card.build()
      }
      if(order.membership){
        card = createOrderParseCard(order);
        return card.build()
      }
      // order has been matched  
    var orderParseSection = createOrderParseCard(order)
  
    /** now look through google drive */
    driveSearch(order)
    var driveSearchSection = createDriveSearchCard(order)
    /** now get the email ready */
    let cardHeader = CardService.newCardHeader()
          .setTitle('Retrieving your footage!')
          .setImageStyle(CardService.ImageStyle.CIRCLE)
          .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/sbk_logo.png?v=1679585187942");
  
    var image = CardService.newImage()
        .setImageUrl("https://cdn.glitch.global/345b4a37-e5cb-4b8c-bcd6-71b41bee8341/train.PNG?v=1679591618624")
        .setAltText('Castle in the Sky Train') 
    var imageSection = CardService.newCardSection()
        .addWidget(image)
  
    card = CardService.newCardBuilder()
        .setHeader(cardHeader)
        .addSection(imageSection)
        .addSection(orderParseSection)
        .addSection(driveSearchSection)
    return card.build()
  }
  
  /**
   * Called by onMessage to contain order parsing visuals 
   * @param {orderDetails} The order defined in backend
   * @returns {CardService.Card} User visuals for parsing order notification email
  */
  
  function createDriveSearchCard(order){  
  
     var textParagraph = CardService.newTextParagraph()
          .setText(order.searchResult)
  
      var makeDraftAction = CardService.newAction()
        .setFunctionName("writeDraft")
        .setParameters({name: order.customerName, choreographer: order.choreographer, link: (order.link ? order.link : order.searchResult), email: order.customerEmail})
  
      var textButtonOne = CardService.newTextButton()
          .setText(order.sendLabel ? order.sendLabel : 'not found') //foundFolder.footage
          .setComposeAction(
            makeDraftAction,
            CardService.ComposedEmailType.STANDALONE_DRAFT
          )
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor('#5c3e74')
  
      var buttonSet = CardService.newButtonSet()
        .addButton(textButtonOne)
  
      var driveSearchSection = CardService.newCardSection()
        .setHeader("Search for " + order.choreographer + ' / ' + order.classDate + ' / ' + order.groupNumber + ".mov")
        .addWidget(textParagraph)
        .addWidget(buttonSet)
      
      return driveSearchSection
  }
  
  function writeDraft(e) { 
    var first = e.parameters.name.split(' ')[0];
    var body = first + ",\nThanks for joining us at " + e.parameters.choreographer + "'s class! You can access your footage at: " + 
      (e.parameters.link) + " \nIf you have any issues accessing your footage, feel free to reply to this email and let us know. See you next time!"
    /** TODO: make e.parameters.email */  
    var draft = GmailApp.createDraft(e.parameters.email, ('PandaKoMedia Xpress Class Footage for ' + first), body)
    return CardService.newComposeActionResponseBuilder()
      .setGmailDraft(draft).build()
  }
  