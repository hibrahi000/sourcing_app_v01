const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const employee = require('../models/Employee').Employee;

const mongoose = require('mongoose');
const key = process.env;

function passport(passport) {
	console.log('----------------------- START PASSPORT ----------------');

	mongoose
		.connect(key.mongo_connect_uri, { useNewUrlParser: true, useUnifiedTopology: true})
		.then(() => {
			// ^^ just a little fun with the console not really needed.
			console.log('Connected to Mongo Atlas DB.....');
			setTimeout(() => {
				console.log('-->');
			}, 200);
			setTimeout(() => {
				console.log('---->');
			}, 500);
			setTimeout(() => {
				console.log('------> connected and running on PORT 500');
			}, 700);
			
		})
		.catch((err) => console.log(err));

		passport.use(
			'purchPass',
			new LocalStrategy({ usernameField: 'userName' }, (userName, password, done) => {
				//match user
				console.log('entering passport PURCH');
				employee
					.findOne({ Username: userName })
					.then((empl) => {
						if (!empl) {
							console.log('entering passport !empl');
							return done(null, false, { message: 'Invalid username or password' });
						}
						console.log('user found');
						//match password
						bcrypt.compare(password, empl.Password, (err, isMatch) => {
							if (err) throw err;
	
							if (isMatch) {
								console.log('passFound');
								//check to see if purchase
								employee.findOne({ Username: userName }).then((empl) => {
									if (empl.Department != 'Purchasing') {
										console.log('Not Dep Purch');
										if (!empl.Admin) {
											console.log('Not Admin');
											return done(null, false, {
												message: 'It seems like you dont have permision to acces this site'
											});
										} else {
											console.log('is admin USER:' + userName);
											return done(null, empl);
										}
									} else {
										console.log('is Purch USER: ' + userName);
										connectABHPharmaDB();
									return done(null, empl);
									}
								});
							} else {
								return done(null, false, { message: 'Invalid username or password' });
							}
						});
					})
					.catch((err) => console.log(err));
			})
		);

		passport.use(
			'adminPass',
			new LocalStrategy({ usernameField: 'userName' }, (userName, password, done) => {
				// ++ Match user
				console.log(`hello`);

				employee
					.findOne({ Username: userName })
					.then((staff) => {
						console.log('enter')
						// console.log(staff);
						// :: if staff is not found
						if (!staff) {
							console.log("Attempt's was made to log into sales Login: " + userName);
							console.log('starting');
							return done(null, false);
						}
						// ::If staff is found check for password
						bcrypt.compare(password, staff.Password, (err, isMatch) => {
							if (err) throw err;
							if (isMatch) {
								console.log('Manager Verification ....');
								// ::now we check to see if they are At Manager Tier or Admin
								if (!staff.Manager || !staff.Admin) {
									console.log('Not Manager or Admin');
									return done(null, false);
								} else {
									// :: if this is one of the Manager or Admin staff
									console.log('Manager/Admin logging into Manager Portal User: ' + userName);

									return done(null, staff);
								}
							} else {
								console.log('Invalid Credentials');
								return done(null, false);
							}
						});
					})
					.catch((err) => {
						console.log('err with searching database');
					});
			})
		);

	passport.serializeUser((employee, done) => {
		console.log('serialized');
		done(null, employee);
	});

	passport.deserializeUser((id, done) => {
		employee.findById(id, function(err, user) {
			done(err, user);
		});
	});
}

module.exports = passport;
