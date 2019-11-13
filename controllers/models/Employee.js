const mongoose = require('mongoose');

const Employee = mongoose.model(
	'Employees',
	new mongoose.Schema({
		
		FirstName: {
			type: String,
			required: true
		},
		LastName: {
			type: String,
			required: true
		},
		Email: {
			type: String,
			required: true
		},
		Cell: {
			type: String,
			required: true
		},
		Department: {
			type: String,
			required: true
		},
		Admin: {
			type: Boolean,
			default: false
		},
		Manager: {
			type: Boolean,
			default: false
		},
		Schedule: {
			Monday: {
				type: String,
				default: '9 to 5'
			},
			Tuesday: {
				type: String,
				default: '9 to 5'
			},
			Wednesday: {
				type: String,
				default: '9 to 5'
			},
			Thursday: {
				type: String,
				default: '9 to 5'
			},
			Friday: {
				type: String,
				default: '9 to 5'
			}
		},
		Username: {
			type: String,
			required: true
		},
		Password: {
			type: String,
			default: null
		},
		PlainPassword: {
			type: String,
			default: null
		},
		DateCreated: {
			type: String,
			default: Date
		},
		ProfilePic: {
			data: Buffer,
			contentType: String
		}
	}),
	'Employees',
);

module.exports = { Employee };
