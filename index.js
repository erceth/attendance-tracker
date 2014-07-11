var express    = require('express');
var app        = express(); 	
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ericet');

var Attendee = require('./app/models/attendee');

//app.use(bodyParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 9000; 

var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
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
router.route('/attendee/:attendee_id')
	/*
	get an attendee by id
	input: attendee_id via GET parameter
	output: {{fullName: <name>, datesAttended:{date: <date>, date: <date>}}
	*/
	.get(function(req, res) {
		Attendee.findById(req.params.attendee_id, function(err, attendee) {
			if (err) {
				res.send(err);
			} else {
				res.json(attendee);
			}
		});
	}); 
router.route('/here/:attendee_id')
	/*
	update attendee by id
	input: {id: <id>, attendence: {date: <date>}}
	output: none
	*/
	.post(function(req, res) {
		Attendee.findById(req.params.attendee_id, function(err, attendee) {
			if(err) {
				res.send(err);
			} else {
				console.log("log");
				attendee.datesAttended.push(req.body.date);
				attendee.save(function(err) {
					if (err) {
						res.send(err);
					} else {
						res.json({message: "Attendee updated"});
					}
				});	
			}
		});
	});
router.route('/attendee/delete/:attendee_id')
	/*
	delete attendee
	input: attendee_id via GET
	output: none
	*/
	.get(function(req, res) {
		Attendee.remove({
			_id: req.params.attendee_id
		}, function(err, attendee) {
			if(err) {
				res.send(err);
			} else {
				res.json({message: 'deleted'})
			}
		});
	});

router.route('/text')
	/*
	text recieved
	*/
	.get(function(req, res) {
		console.log("text recieved!");
	});

app.use('/api', router);


app.listen(port);
console.log('Magic happens on port ' + port);
