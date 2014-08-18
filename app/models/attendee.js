var mongoose = require('mongoose');

var AttendeeSchema = new mongoose.Schema({
	fullName: {
		type: String,
		require: true
	},
	dateJoined: {
		type: Date
	},
	phoneNumber: {
		type: String,
		required: true
	},
	messages: [{
		type: mongoose.Schema.Types.ObjectId, ref: "Message"
	}]
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
