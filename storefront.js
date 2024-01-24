function storePages(){
    var headers = {
      'Authorization': 'Bearer key'
    }
    var options = {
      'method': 'get',
      'contentType': 'application/json',
      'headers': headers
    }  
  
    var response = UrlFetchApp.fetch("https://api.squarespace.com/1.0/commerce/store_pages", options)
    var result = JSON.parse(response.getContentText());
    var stores = result.storePages;
    stores.forEach(function(storePage){
      console.log('store id is ' + storePage.id + ' for the store named ' + storePage.title)
    })
  }
  
  function createProduct() {
    var headers = {
      'Authorization': 'Bearer key'
    }
    var payload = {
      'type': 'PHYSICAL',
      'storePageId': '643c66eeda25427c437a613f',
      'name': 'hey boss',
      'isVisible': 'true',
      'variants': [
        {
          'sku': 'SQ1',
          'stock': {
            'unlimited': 'true'
          },
          'pricing': {
            'basePrice': {
              'currency': 'USD',
              'value': '15.00'
            }
          }
        }
      ]
    }
    var options = {
      'method': 'post',
      'contentType': 'application/json',
      'headers': headers,
      'payload': JSON.stringify(payload)
    }
  
    var response = UrlFetchApp.fetch("https://api.squarespace.com/1.0/commerce/products/", options)
    var result = JSON.parse(response.getContentText());
    console.log('new product made with id: ' + result.id + ' and name: ' + result.name)
  }
