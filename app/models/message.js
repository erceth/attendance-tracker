var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
	_userID: {
		type: String,
		ref: 'Attendee'
	},
	phoneNumber: {
		type: String,
		require: true
	},
	date: {
		type: Date
	},
	body: {
		type: String,
		required: true
	},
	sid: {
		type: String,
		required: true
	}
	
});

module.exports = mongoose.model('Message', MessageSchema);
