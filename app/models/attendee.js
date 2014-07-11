var mongoose = require('mongoose');

var AttendeeSchema = new mongoose.Schema({
	fullName: {
		type: String,
		require: true
	},
	datesAttended: [String]
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
