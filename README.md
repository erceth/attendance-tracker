Attendance SMS Tracker
==================

## Overview
Tracks classroom attendance using SMS messaging and displays it using google spreadsheet.

This is not a very thorough readme file.  If you want to set this up there will be plenty of problems you will need to figure out on your own.
Pull requests are welcome.

## Technologies used
Javascript, Node, Google Apps Script, AngularJS, Mongoose (MongoDB), Express router, Twilio

## File structure breakdown
- app/models - mongoose schemas used in database
- public - admin view to manage phone numbers and attendance marked.  Utilizes AngularJS, Grunt, Bower, Bootstrap
- config.template.js - template to create config.js file.  config.js contains twillio credentials and other private information.
- google_script.template.gs - template to create google_scipt.gs.  google_script.gs written in Google Apps Script which is essentially Javascript with a few google doc globals.  This file needs to be placed in the script editor of the google spreadsheet you would like the attendance to display in.
- index.js - Script to be run using node to spin up a node server.  Uses express for routing and Mongoose for database.  Retrieves data from Twillio and provides API calls for google apps script and admin view.

## Setting up
- Create a free (recommened at first) or paid Twillio account.  
- Create server where your server and database will live.  Make sure the server is accessable to the web because Twillio will need to be able to access it (no localhost).
- Copy files into server (git clone) except for google_script.template.gs (you can if you want but it won't be used here).
- Create config.js using config.template.js.  Fill in the twilioAccountDid, twilioauthToken and twillioPhoneNumber from Twilio account.  Fill in wordOfDayPassword.
- In twillio account create a new TwiML App.  Fill request URL with http://YOUR.DOMAIN.com/api/text.  Twillio will send a push to your server whenever it receives a text.
- Install mongoDB
- Install node package files (npm install), bower files (bower install) and run grunt (grunt)
- Create google spreadsheet with your google account.
- Open up the script editor and create a new script and paste in the code from google_script.template.gs. Fill in value for apiURL with domain name of your server.  This allows your google spreadsheet to access your server.  Also fill in datesOfWeekToTrack with the days of the week you would like to track (i.e. [0,1,2,3,4,5,6]). 
run your server using node (node index.js).

## Using the app
If using free version of twilio you will need to register each phone number twillio sends texts to with twillio.

### How to register
- text the following to your twillio number replace firstName and lastName appropriately (case sensitive): 
register firstName lastName

### How to mark attendance 
- simply text the word of the day to your twillio number (case insensitive).

Check your google doc and hopefully your name and date marked should be there.


