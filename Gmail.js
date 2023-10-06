

function driveSearch(order) {
      var searchResult = '';
      var sharedFolder = DriveApp.getFolderById("1e6WCs-mqxLXYFeCpj2VncEQCH9zkRaaj");
      // Agree on exact name matching 
      var choreographerFolder = sharedFolder.getFoldersByName(order.choreographer);
      var buttonLabel = 'No folders found';
      var nameVariations = [' Exports', ' AJ Exports', ' TP Exports', ' DS Exports', ' FC Exports'];
      /** Match the Choreographer */ 
      while(choreographerFolder.hasNext()){
        var foundChoreographerFolder = choreographerFolder.next();
        searchResult += foundChoreographerFolder.getName() + " | Choreographer folder found\n";
        // buttonLabel = foundChoreographerFolder.getName();
        // Agree on year matching rules (2023, 2022)
        var today = new Date();
        var thisYear = today.getFullYear();
        /** Match the Year */
        var yearFolders = foundChoreographerFolder.getFoldersByName(thisYear);
        while(yearFolders.hasNext()){
          var yearMatchFolder = yearFolders.next();
          searchResult+= yearMatchFolder.getName() + " | Year folder found \n";
          // buttonLabel += '/' + yearMatchFolder.getName();
          
          /** Class Day > Class Day Exports Folder Structure */
          var classDateFolder = yearMatchFolder.getFoldersByName(order.classDate.trim());
          while (classDateFolder.hasNext()){
            var classMatchFolder = classDateFolder.next();
            searchResult += classMatchFolder.getName() + " | Class folder found\n"
            // buttonLabel += '/' + classMatchFolder.getName();
            /** Match the processed footage folder */
          //AJ: agree on allowable variations of processed folder names
          nameVariations.forEach(function(folderSuffix){
          var folderGuess = order.classDate.trim() + folderSuffix;
          var processedFolder = classMatchFolder.getFoldersByName(folderGuess);
          while(processedFolder.hasNext()){
          var _foundClass = processedFolder.next();
          searchResult += _foundClass.getName() + " | footage folder found\n";
          buttonLabel = _foundClass.getName()
          var groupFooties = _foundClass.getFiles();
          if(!groupFooties.hasNext()){
            searchResult += '\n no files found in folder?'
          }
          while (groupFooties.hasNext()){
            var videoFile = groupFooties.next();
            var fileName = videoFile.getName();
            /** Match the video file to group number */
            if(fileName.indexOf('.mov')!= -1 && order.groupNumber){
              fileName = fileName.slice(0,fileName.lastIndexOf('.'));
              console.log('file in class folder: ' + fileName)
              let groupVariation = 'G' + String(order.groupNumber.trim());
              if(fileName === String(order.groupNumber.trim()) || (fileName === groupVariation)){
                searchResult += fileName + ".mov | Footage Video Found";
                buttonLabel = buttonLabel + "/" + fileName + ".mov"
                videoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                var url = "http://drive.google.com/uc?export=view&id=" + videoFile.getId();
                order.link = url;
                order.sendLabel = buttonLabel;
                order.searchResult = searchResult;
                return order
                }
            }
            }
          }
        });
        }
        /** Processed footage at top level */
          nameVariations.forEach(function(folderSuffix){
          var folderGuess = order.classDate.trim() + folderSuffix;
          var processedFolder = yearMatchFolder.getFoldersByName(folderGuess);
          while(processedFolder.hasNext()){
          var _foundClass = processedFolder.next();
          searchResult += _foundClass.getName() + " | footage folder found\n";
          buttonLabel = _foundClass.getName()
          var groupFooties = _foundClass.getFiles();
          if(!groupFooties.hasNext()){
            searchResult += '\n no files found in folder?'
          }
          while (groupFooties.hasNext()){
            var videoFile = groupFooties.next();
            var fileName = videoFile.getName();
            /** Match the video file to group number */
            if(fileName.indexOf('.mov')!= -1 && order.groupNumber){
              fileName = fileName.slice(0,fileName.lastIndexOf('.'));
              console.log('file in class folder: ' + fileName)
              let groupVariation = 'G' + String(order.groupNumber.trim());
              if(fileName === String(order.groupNumber.trim()) || fileName === groupVariation){
                searchResult += fileName + ".mov | Footage Video Found";
                buttonLabel = buttonLabel + "/" + fileName + ".mov"
                videoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                var url = "http://drive.google.com/uc?export=view&id=" + videoFile.getId();
                order.link = url;
                order.sendLabel = buttonLabel;
                order.searchResult = searchResult;
                return order
                }
            }
            }
          }
        });

    }
  }
  order.sendLabel = buttonLabel;
  order.searchResult = searchResult;
 return order
}

function appendShareableLink(item) {
  item.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT);
  append = "http://drive.google.com/uc?export=view&id=" + item.getId() + "\n";
  return append
}

class SquareSpace {
  constructor(){
    this.headers = {
    'Authorization': 'Bearer 2ffdb94c-4062-4e43-a49a-bddc69240e7d'}
    this.options = {
      'contentType' : 'application/json',
      'headers': this.headers}
    this.urlBase = "https://api.squarespace.com/1.0/commerce/"
    }
    get(apiCall){
      let options = this.options;
      options.method = 'get';
      let apiString = this.urlBase + apiCall;
      let response = UrlFetchApp.fetch(apiString,options);
      var result = JSON.parse(response.getContentText());
      return result
    }   
}