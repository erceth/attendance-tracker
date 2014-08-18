function main() {
  var apiURL = "yourAPI.com/api";
  var datesOfWeekToTrack = [5]; //Sun = 0, Mon = 1, Tues = 2...
  
  var today = new Date();
  
  //open
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName((today.getMonth()+1) + "/" + today.getFullYear());
  //create new sheet
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet((today.getMonth()+1) + "/" + today.getFullYear() , 0);
  }
  if(sheet) {
    var response = UrlFetchApp.fetch(apiURL + "/api/data/" + (today.getMonth()+1) + "/" + today.getFullYear());
    var data = JSON.parse(response.getContentText());
    var xPadding = 2;
    var yPadding = 2;
    
    var datesToAttend = generateDates(today, datesOfWeekToTrack);
    
    sheet.getRange("A1:Z100").clear(); //clear everything
    
    sheet.getRange(1,2,1, datesToAttend.length).setValues([datesToAttend]); //setValues accepts multi-d array
    
    var allRows = [];

    for(var i = 0; i < data.attendees.length; i++) {
      var row = [];
      row.push(data.attendees[i].fullName);

      for(var j = 0; j < data.attendees[i].messages.length; j++) {
        var messageDate = new Date(data.attendees[i].messages[j].date);
        if (messageDate) {
          for(var k = 0; k < datesToAttend.length; k++) {
            if (messageDate.getDate() === datesToAttend[k].getDate()) {
              row.push("x"); //here
            } else {
              row.push("");  //not here
            }
          }
          allRows.push(row);
        }
      }
    }
    
    allRows.sort(
      function(a, b) {
        a = a[0]; //sort only the first column
        b = b[0];
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;
      }
    );
    
    sheet.getRange(2,1,allRows.length, allRows[0].length).setValues(allRows); //prints all rows
  }
}

//generates the dates to track if attended
function generateDates(today, datesOfWeekToTrack) {
  var date = new Date(today.getFullYear(), today.getMonth(), 1)
  var result = [];
  while(date.getMonth() === today.getMonth()) {
    if(datesOfWeekToTrack.indexOf(date.getDay()) >= 0) {
      result.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    }
    date.setDate(date.getDate()+1); //increment
  }
  return result;
}


function nextChar(c) {
  if(c === "Z"){throw "last letter!";}
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

function letterToNumber(letter) {
  if(letter === "Z"){throw "last letter!";}
  return letter.charCodeAt(0) - 97
}

function numberToLetter(n) {
    var s = "";
    while(n >= 0) {
        s = String.fromCharCode(n % 26 + 97) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s.toUpperCase();
}

