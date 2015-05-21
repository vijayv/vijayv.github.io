---
layout: post
title: Live Dashboards with Google Sheets
thumb: Live Dashboards with Google Sheets.png
blurb: Query a SQL database with Google Sheets for simple and effective dashboards that are easy to maintain and share.
---

Distributing dashboards and reports to different departments at a small company without a big BI budget is a challenging task. In Excel, you can use a combination of a JDBC connection, a simple VB Script to refresh reports, and a shared directory to share it with the company. However, this has some limitations, especially when a majority of users are on non-Windows systems.

If you are using Google Apps, however, there is a nice work around. You can use the following script to run a SQL query directly from the spreadsheet by setting the necessary document properties in Google sheets. After setting up the script, simply add a sheet to your spreadsheet called "SQL" and add your query in cell A3. You can save this file as a template and "Save As" for different queries and different reports. This makes it quite easy to build sophisticated dashboards that are cross platform, easily updatable, sharable, and very easy to maintain.

```
// Get Db Params
var documentProperties = PropertiesService.getScriptProperties();
var address =  documentProperties.getProperty('dw_address'); // IP address of your database server
var user = documentProperties.getProperty('user'); // database user (ensure this user only has minimum necessary)
var userPwd = documentProperties.getProperty('userPwd'); // database user password
var db = documentProperties.getProperty('db'); // database that you intend to use
var dbUrl = 'jdbc:mysql://' + address + '/' + db;


// Entry point for the function that runs the query
// This is the function that is actually called by the reports
function runSQL() {

  Logger.log("Starting runSQL");

  var sql_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SQL");

  if (sql_sheet == null) {
    Logger.log("No SQL sheet was found");
    SpreadsheetApp.getUi().alert('SQL Sheet Not Found, Add Sheet Named "SQL"');
  }
  else {
    var lr = sql_sheet.getLastRow();
    Logger.log("Found queries:",lr);
    for (var row = 2; row <= lr; row++) {
      var tab_name = sql_sheet.getRange(row, 1).getValue();
      var rows_to_skip = sql_sheet.getRange(row, 2).getValue();
      var sql_query = sql_sheet.getRange(row, 3).getValue();
      // execute query
      getFromDW(tab_name, sql_query, rows_to_skip);

    }
  }
}

// Main function that does the actualy work
function getFromDW(vtab_name, vsql, rows_to_skip) {

  // Log start time
  var start = new Date();
  Logger.log("Starting Query Refresh: "+ start);
  Logger.log("Refreshing tab: "+ vtab_name + " in " + SpreadsheetApp.getActiveSpreadsheet().getName());

  // Connect to db
  var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  var stmt = conn.createStatement();
  // Limit rows to stop any row limit issues
  stmt.setMaxRows(20000);
  var results = stmt.executeQuery(vsql);

  Logger.log("Successfully executed SQL Query");

  // Get metadata
  var numCols = results.getMetaData().getColumnCount();
  var lastCol = columnToLetter(numCols);
  var eventsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(vtab_name);

  // Push fresh data in to array
  var freshData = new Array();
  var i = 0;

  while (results.next()) {
    i++
    line = new Array();

    for (var col = 0; col < numCols; col++) {
      line.push(results.getString(col + 1));
    }

    freshData.push(line);
  }

  var headerRow = rows_to_skip

  var startRow = headerRow + 1;
  var numRows = headerRow + i;
  var delRow = lastCol + eventsSheet.getLastRow();
  var lastCell = lastCol + numRows;

  eventsSheet.getRange("A"+startRow+":"+delRow).clear();
  Logger.log("Range Successfully Cleared");

  // Check to see if the query returned any rows
  if(i > 0){
    // get and paste column headers
    // set values expects a 2d array
    var headers = new Array()
    var headerR = new Array()
    for (var col = 0; col < numCols; col++) {
      headerR.push(results.getMetaData().getColumnName(col + 1));
    }
    headers.push(headerR)
    eventsSheet.getRange("A"+headerRow+":"+lastCol+headerRow).setValues(headers);

    try {
      Logger.log("Adding fresh data to selected range");
      var rrange = eventsSheet.getRange("A"+startRow+":"+lastCell);
      rrange.setValues(freshData);
    } catch(e) {
      Logger.log(e.message);
      var body = Logger.getLog();
      MailApp.sendEmail("vijayv@ischool.berkeley.edu", "DB Connection Failure", body);
      throw new Error("Unable to paste data on the sheet.")
    }

    results.close();
    stmt.close();
  }
  else {
    Logger.log("Query on tab: "+ vtab_name + " in " + SpreadsheetApp.getActiveSpreadsheet().getName() + "returned no rows. Skipping.")
  }
  // Log elapsed time
  var end = new Date();
  Logger.log('Successfully Refreshed Query on ' + vtab_name)
  Logger.log('Time elapsed: %sms', end - start);
}

// Helper functions

function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function letterToColumn(letter)
{
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}
```
