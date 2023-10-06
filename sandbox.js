// jasonKey
// 2ffdb94c-4062-4e43-a49a-bddc69240e7d

function sandbox() {
    var headers = {
      'Authorization': 'Bearer 2ffdb94c-4062-4e43-a49a-bddc69240e7d'
    }
    var options = {
      'method': 'get',
      'contentType': 'application/json',
      'headers': headers
    }
    var response = UrlFetchApp.fetch("https://api.squarespace.com/1.0/commerce/orders?modifiedAfter=2023-03-01T12:00:00Z&modifiedBefore=2023-03-15T12:30:00Z",options);
    var result = JSON.parse(response.getContentText());
    var orders = result.result
    orders.forEach(function(order){
      console.log([order.billingAddress.firstName,order.billingAddress.lastName, order.customerEmail, order.createdOn,order.lineItems[0]["productName"]].join(' '))
    })
  
  }
  
  function driveSearchDev(){
    let choreographer = 'Fullout Cortland';
    let classDate = '04.19.23';
    let groupNumber = 2;
    var sharedFolder = DriveApp.getFolderById("1e6WCs-mqxLXYFeCpj2VncEQCH9zkRaaj");
    var choreographerFolder = sharedFolder.getFoldersByName(choreographer);
    while(choreographerFolder.hasNext()){
      var foundChoreographerFolder = choreographerFolder.next();
      // match the year
      var today = new Date();
      var thisYear = today.getFullYear();
      var yearFolders = foundChoreographerFolder.getFoldersByName(thisYear);
      while(yearFolders.hasNext()){
        var yearMatchFolder = yearFolders.next();
        console.log('in folder ' + yearMatchFolder.getName())
        var nameVariations = [' Exports', ' FC Exports'];
        nameVariations.forEach(function(folderSuffix){
        var folderGuess = classDate + folderSuffix;
        var classFolder = yearMatchFolder.getFoldersByName(folderGuess);
        while(classFolder.hasNext()){
        var _foundClass = classFolder.next();
        console.log('found class folder ' + _foundClass.getName())
        var groupFooties = _foundClass.getFiles();
        console.log(groupFooties.toString())
        while (groupFooties.hasNext()){
          var videoFile = groupFooties.next();
          var fileName = videoFile.getName();
          fileName = fileName.slice(0,fileName.lastIndexOf('.'));
          console.log('file in class folder: ' + fileName)
          if(fileName == groupNumber){
            console.log('found exact name match ' + fileName);
            videoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            var url = "http://drive.google.com/uc?export=view&id=" + videoFile.getId();
            console.log('sharing link is ' + url);
            // order.url = url;
            // return order
            }
          }
        }
      });
      }
    }
  }
  
  function shortenUrl(longURL) {
    var url = 'https://www.googleapis.com/urlshortener/v1/url';
  
    var longURL = 'http://drive.google.com/uc?export=view&id=1MApPqRoop-niFCFy4nkh2WgC9m4dPtC8'
    var payload = { longUrl: longURL };
  
    var parameters = {
      method: 'post',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      payload: JSON.stringify(payload),
      contentType: 'application/json',
      muteHttpExceptions: true,
    };
  
    var response = UrlFetchApp.fetch(url, parameters);
  
    Logger.log(response);
  }
  
  
  function main(){
    let sq = new SquareSpace();
    var testOrder = new orderDetails();
    testOrder.orderNumber = "04832";
    const today = new Date();
    let tomorrow = Utilities.formatDate(new Date(new Date().setDate(today.getDate() + 2)),"GMT-4", "yyyy-MM-dd") + "T12:00:00Z";
    let yesterday = Utilities.formatDate(new Date(new Date().setDate(today.getDate() - 2)),"GMT-4", "yyyy-MM-dd") + "T12:00:00Z";
    let result = sq.get("orders?modifiedAfter=" + yesterday + "&modifiedBefore=" + tomorrow)
    let orders = result.result;
    orders.forEach(function(_order){
      __parseProductInfo(testOrder, _order.lineItems[0]["productName"], _order)
    })
  }
  // @TODO: This algorithm could be better but form should just be better
  function __parseProductInfo(order, productName, _order) { 
    order.id = _order.id
    if(productName.indexOf('Standard Membership')!=-1){
      order.membership = true;
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
      console.log(JSON.stringify(order,null,4));
      return order
    }
    catch {
      order.choreographer = productName;
      order.classDate = productName;
      return order
    } 
  }