//Link Google Sheet: https://docs.google.com/spreadsheets/d/1gwnUtLEAK3he_U9P8SbUWoiIxxJgPlH2IRGpL-qHtBk/edit?usp=sharing
// Enter Spreadsheet ID here
var SS = SpreadsheetApp.openById('1gwnUtLEAK3he_U9P8SbUWoiIxxJgPlH2IRGpL-qHtBk');
var timezone = "asia/Kuala_Lumpur";
var hours = 0;
var str = "";


function doPost(e) {

  var parsedData;
  var result = {};
  
  try { 
    parsedData = JSON.parse(e.postData.contents);
  } 
  catch(f){
    return ContentService.createTextOutput("Error in parsing request body: " + f.message);
  }
   
  if (parsedData !== undefined){
    var flag = parsedData.format;
    if (flag === undefined){
      flag = 0;
    }
    
    var sheet = SS.getSheetByName(parsedData.sheet_name); // sheet name to publish data to is specified in Arduino code
    var dataArr = parsedData.values.split(","); // creates an array of the values to publish 
         
    var Curr_Date = Utilities.formatDate(new Date(), timezone, "MM/dd/yyyy"); // gets the current date
    var Curr_Time = Utilities.formatDate(new Date(), timezone, "hh:mm:ss a"); // gets the current time
    //var Curr_Date = new Date(new Date().setHours(new Date().getHours() + hours));
    //var Curr_Time = Utilities.formatDate(Curr_Date, timezone, 'HH:mm:ss');

    // comming from Arduino code
    var value0 = dataArr [0];  //Student ID
    var value1 = dataArr [1];  //First Name
    var value2 = dataArr [2];  //Last Name
    var value3 = dataArr [3];  //Phone Number
    var value4 = dataArr [4];  //Address
    var value5 = dataArr [5];  //Gate Number
  
    //------------------------------------------------------------------------------------------------------
    /* STEP1 - This piece of code searches for the student ID in the attendance sheet. If the student ID is found, 
    it gets the row number of that student ID and retrieves their time-out data. 
    */
    var data = sheet.getDataRange().getValues();
    var row_number = 0;
    var time_out = "";
    //for(var i = data.length - 1; i >= 0; i--){  // Search last occurrence 
    for(var i = 0; i < data.length ; i++){  // Search first occurrence of student id
      if(data[i][0] == value0){ //data[i][0] i.e. [0]=Column A, Student_id
        row_number = i+1;
        time_out = data[i][2] //time out [2]=Column C
        
        console.log("row number: "+row_number); //print row number
        console.log("time out: "+time_out); //print row number
		break; //go outside the loop
      }
    }
    /* STEP2 - Next, it checks if the time-out variable is empty. If it is empty, the current time is added to the 
    time-out field and a message is returned to NodeMcu. 
    */
    if(row_number > 0){
      if(time_out === ""){
        sheet.getRange("C"+row_number).setValue(Curr_Time);
        str = "Success"; // string to return back to Arduino serial console
        return ContentService.createTextOutput(str);
      }
    }
    //Otherwise,the attendance is recorded as usual using the code written below
    //------------------------------------------------------------------------------------------------------    
    
    // read and execute command from the "payload_base" string specified in Arduino code
    switch (parsedData.command) {
      
      case "insert_row":
         
         sheet.insertRows(2); // insert full row directly below header text
         
         sheet.getRange('A2').setValue(value0);     // publish STUDENT ID to cell A2
         sheet.getRange('B2').setValue(Curr_Time);  // publish TIME IN to cell B2
         //sheet.getRange('C2').setValue();         // publish TIME OUT to cell C2
         sheet.getRange('D2').setValue(value5);     // publish GATE NUMBER to cell D2
         sheet.getRange('E2').setValue(Curr_Date);  // publish DATE to cell E2
         sheet.getRange('F2').setValue(value1);     // publish FIRST NAME cell F2
         sheet.getRange('G2').setValue(value2);     // publish LAST NAME cell G2
         sheet.getRange('H2').setValue(value3);     // publish PHONE NUMBER cell H2
         sheet.getRange('I2').setValue(value4);     // publish ADDRESS cell I2
         
         str = "Success"; // string to return back to Arduino serial console
         SpreadsheetApp.flush();
         break;
         
      case "append_row":
         
         var publish_array = new Array(); // create a new array
         
         publish_array [0] = value0;    // publish Student ID to cell A2
         publish_array [1] = Curr_Time; // publish Time In to cell B2
         publish_array [3] = Curr_Date; // publish current date to cell D2
         publish_array [4] = value1;    // publish First Name cell E2
         publish_array [5] = value2;    // publish Last Name cell F2
         
         sheet.appendRow(publish_array); // publish data in publish_array after the last row of data in the sheet
         
         str = "Success"; // string to return back to Arduino serial console
         SpreadsheetApp.flush();
         break;     
    }
    
    return ContentService.createTextOutput(str);
  } // endif (parsedData !== undefined)
  
  else {
    return ContentService.createTextOutput("Error! Request body empty or in incorrect format.");
  }
}
