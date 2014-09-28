var express    = require('express');
var app        = express(); 	
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ericet');

var Attendee = require('./app/models/attendee');
var Message = require('./app/models/message');
var Config = require('./config');
var Twilio = require('twilio')(Config.twilioAccountSid, Config.twilioAuthToken);

var twilioPhoneNumber = Config.twillioPhoneNumber;
var wordOfTheDay = "mormon";  //default word of the day
var fetchFromTwilio = true;

var retrieveMessagesSince = function() {
	var date = new Date();
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(); //optimiziation
	//return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + "1";
};

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 80; 

var router = express.Router();

app.use(express.static(__dirname + '/public'));

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

router.route('/setword/:newword/:password').get(function(req,res){
	var newWord = req.params.newword;
	var password = req.params.password;
	
	if (password === Config.wordOfDayPassword) {
		wordOfTheDay = newWord;
		res.json({message: "word of the day updated to " + wordOfTheDay});
	}
});

//triggers a call to Twillio
router.route('/text')
	/*
	text recieved
	*/
	.get(function(req, res) {
		if (fetchFromTwilio) { //only first call to this api triggers twillio fetch.
			fetchFromTwilio = false;
			setTimeout(function() { //wait 3 secs before fetching.  Allows messages to accumulate into batches.
				getTwilioMessages();
				console.log("fetching from Twillio!");
				fetchFromTwilio = true; 
				res.json({message: ''});
			}, 3000);
		}
	});
	
var getTwilioMessages = function() {
	Twilio.messages.list({
		'dateSent>': retrieveMessagesSince(),
	},function(err,data) {
		siftMessages(data);
	});
}
		
var siftMessages = function(data) {
	var duplicateRegistraion = [];
	data.messages.forEach(function(message) {
		var messageBodyArray = message.body.split(' ');
		
		//check input
		if (messageBodyArray[0]) {
			messageBodyArray[0] = messageBodyArray[0].toLowerCase();
		}
		
		//register
		if (messageBodyArray[0] === "register" && messageBodyArray[1] && messageBodyArray[2]) {
			if (duplicateRegistraion.indexOf(message.from) < 0) { //prevents dup attendees created if data.messages contains more than one register message
				duplicateRegistraion.push(message.from);
			
				Attendee.count({'phoneNumber': message.from}, function(err, count) {
					if (err) {console.log(err);}
					if (count === 0) {
						var newAttendee = new Attendee({
							fullName: messageBodyArray[1] + " " + messageBodyArray[2],
							dateJoined: new Date(message.date_sent),
							phoneNumber: message.from
						});
						newAttendee.save(function(err) {
							if(err) {console.log(err);}
							else {
								console.log('new attendee created!');
								
								Twilio.sms.messages.create({
									body: "Welcome " +  newAttendee.fullName + "! You are registered.",
									to: message.from,
									from: twilioPhoneNumber
								});
							}
						});
					}
				});
			} else {
				console.log("duplicated register message");
			}
			
		} else if (messageBodyArray[0] === wordOfTheDay) {
			Message.count({'sid': message.sid}, function(err, count) {
				if(err){console.log(err);}
				if (count === 0) {
					Attendee.findOne({'phoneNumber': message.from}, function(err, attendee) {
						if(err){console.log(err);}
						var newMessage = new Message({
							_userID: attendee._id,
							phoneNumber: message.from,
							body: message.body,
							date: new Date(message.date_sent),
							sid: message.sid
						});
						newMessage.save(function(err){
							if(err){console.log(err)};
							console.log("message saved");
							Twilio.sms.messages.create({
								body: attendee.fullName + ", your attendance for " + newMessage.date.toDateString() + " has been recorded.",
								to: message.from,
								from: twilioPhoneNumber
							});
							
						});
						attendee.messages.push(newMessage);
						attendee.save(function(){
							if (err) {res.send(err);}
						});
					});
				}
			});
		}
    });
};

router.route('/data/:month/:year')
	//get all Attendees and messages only for month of :month :year and greater. (TODO: retrieve only this month)
	.get(function(req, res) {
		var month = req.params.month;
		var year = req.params.year;
		
		if (parseInt(month, 10) && parseInt(year, 10)) {
			var thisMonth = new Date(month + "-1-" + year);
			var nextMonth = new Date((month + 1) + "-1-" + year);
			
			Attendee.find()
			.populate(
				{
					path: 'messages',
					match: {date: {$gte: thisMonth}}
				}
			)
			
			.exec(function(err, attendees) {
				if (err) {res.send(err);}
				res.json({"attendees":attendees});
			});
		} else {
			res.json({"message":"params not numbers"});
		}
	});	


router.route('/attendee')
	/*
	creates a new attendee
	input: {fullName: <name>}
	output: none
	*/
	.post(function(req, res) {
		var attendee = new Attendee();
		attendee.fullName = req.body.fullName;

		attendee.save(function(err){
			if(err) {
				res.send(err);
			} else {
				res.json({message: 'attendee created!'});
			}
		});
	}) 
	/*
	get all attendees
	input: none
	output: {{fullName: <name>, datesAttended:{date: <date>, date: <date>}}, 
	{fullName: <name>, datesAttended:{date: <date>, date: <date>}}... } 
	*/
	.get(function(req, res) {
		Attendee.find(function(err, attendee) {
			if (err) {
				res.send(err);
			} else {
				res.json(attendee);
			}
		});
	});
	
router.route('/message')
	//get all messages
	.get(function(req, res) {
		Message.find(function(err, message) {
			if (err) {res.send(err);}
			else {
				res.json(message);
			}
		});
	});
	
		
	
//extra routes//

// router.get('/', function(req, res) {
//     res.json({ message: 'hooray! welcome to our api!' });   
// });


router.route('/attendee/:attendee_id')
     /*
     get an attendee by id
     input: attendee_id via GET parameter
     output: {{fullName: <name>, datesAttended:{date: <date>, date: <date>}}
     */
     .get(function(req, res) {
	
	 Attendee.findById(req.params.attendee_id)
	 .populate({
		path: 'messages'	
	 }).exec(function(err, attendees) {
		if (err) { res.send(err);}
		res.json({"attendees" : attendees});
	 });
     });
     
router.route('/attendee/newmessage')
	.post(function(req, res) {
        //find attendee
        Attendee.findOne({'_id':  req.body.id}, function(err, attendee) {
            //create message
            var newMessage = new Message({
                _userID: attendee._id,
                phoneNumber: attendee.phoneNumber,
                body: req.body.message,
                date: new Date(req.body.date),
                sid: "1234"
            });
            //save message
            newMessage.save(function(err){
                if(err){console.log(err)};
                console.log("message saved");
            });
            //save attendee
            attendee.messages.push(newMessage);
            attendee.save(function(){
                if (err) {res.send(err);}
                res.json({message: "success!"});
            });

        });


	});

router.route('/attendee/deletemessage')
    .post(function(req, res) {

        Message.remove({'_id': req.body.id}, function(err, message) {
            if(err) {res.send(err);
            } else {
                Attendee.findOne({'_id':  req.body.userID}, function(err, attendee) {
                    for (var i = 0; i < attendee.messages.length; i++) {
                        if (attendee.messages[i]+'' === req.body.id) { //possible memory leaks
                            attendee.messages.splice(i,1); //delete the message id
                            console.log("deleted message id: ", req.body.id);
                            console.log("attendees messages: ", attendee.messages);
                            break;
                        }
                    }
                    res.json({message: "success!"});
                });
            }
        });

    });


// router.route('/here/:attendee_id')
//     /*
//     update attendee by id
//     input: {id: <id>, attendence: {date: <date>}}
//     output: none
//     */
//     .post(function(req, res) {
//         Attendee.findById(req.params.attendee_id, function(err, attendee) {
//             if(err) {
//                 res.send(err);
//             } else {
//                 console.log("log");
//                 attendee.datesAttended.push(req.body.date);
//                 attendee.save(function(err) {
//                     if (err) {
//                         res.send(err);
//                     } else {
//                         res.json({message: "Attendee updated"});
//                     }
//                 }); 
//             }
//         });
//     });
// router.route('/attendee/delete/:attendee_id')
//     /*
//     delete attendee
//     input: attendee_id via GET
//     output: none
//     */
//     .get(function(req, res) {
//         Attendee.remove({
//             _id: req.params.attendee_id
//         }, function(err, attendee) {
//             if(err) {
//                 res.send(err);
//             } else {
//                 res.json({message: 'deleted'})
//             }
//         });
//     });

app.use('/api', router);


app.listen(port);
console.log('Magic happens on port ' + port);

