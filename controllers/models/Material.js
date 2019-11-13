const mongoose = require('mongoose');

const Material = mongoose.model(
	'Materials',
	new mongoose.Schema({
		Category: {
			type: String,
			required: true
		},
		Material:[{
			
			MaterialName: {
				type: String,
				default : null
			},
			Vendors:{
				type: Array,
				default : null
			}
		}],
		
		DateCreated: {
			type: String,
			default: Date
		}
	}),
	'Materials'
);

module.exports = { Material };
