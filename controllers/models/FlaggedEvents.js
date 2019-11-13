const mongoose = require('mongoose');

const FlaggedEvents = mongoose.model(
	'FlaggedEvents',
	new mongoose.Schema({
		MaterialName: {
			type: String,
			required: true
		},
		Vendors: [
			{
				type: String,
				required: false
			}
		],
		DateCreated: {
			type: String,
			default: Date
		}
	}),
	'FlaggedEvents'
);

module.exports = { FlaggedEvents };
