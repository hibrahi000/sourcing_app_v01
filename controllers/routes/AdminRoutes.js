module.exports = (imports) =>{
    let {bcrypt,app,passport,errors,admin,adminEnsureAuthenticated,employee,mat,vendor,urlencodedParser,connectABHPharmaDB,disconnectABHPharmaDB} = imports;


    //login
	app.get('/ABH_Admin/Login', (req, res) => {
		res.render('adminLogin');
	});

	//login post
	app.post('/ADMIN_login', urlencodedParser, async (req, res, next) => {
		// console.log('recieved post req');
		passport.authenticate('adminPass', (errors, staff) => {
			if(errors) {throw errors};
			if (staff === false) {
				console.log('MANAGER Verification: FAILED')
				req.flash('error_msg','Invalid Credentials');
				res.redirect('/ABH_Admin/Login')
			} else {
				req.logIn(staff,(err) => {
					console.log('MANAGER Verification: PASSED')
					if(err) { return next(err); }
					res.redirect('/ABH_ADMIN/Dashboard');
				})
			}
		})(req, res, next);
	});

	// Dashboard
	app.get('/ABH_ADMIN/Dashboard',adminEnsureAuthenticated, (req, res) => {
		admin = 'dashboard';
		res.render('adminDashboard', { admin });
	});

	//Add user profile
	app.get('/ABH_ADMIN/Dashboard/addUser', adminEnsureAuthenticated, (req, res) => {
		const { firstName, lastName, user_name, Email, department, cell } = '';

		admin = 'addUser';

		res.render('adminDashboard', {
			errors,
			admin,
			firstName: firstName,
			lastName: lastName,
			user_name: user_name,
			Email: Email,
			department: department,
			cell: cell
		});
		// console.log(firstName, lastName,user_name, Email, department, cell);
	});

	// add user post
	app.post('/ABH_ADMIN/Dashboard/addUser', urlencodedParser, adminEnsureAuthenticated, (req, res) => {
		const { firstName, lastName, user_name, Email, department, cell } = req.body;
		var scheduel = [ '9 to 5', '9 to 5', '9 to 5', '9 to 5', '9 to 5' ];
		// console.log(req.body );

		//Add User Profile then disconnect
		employee.findOne({ Username: user_name }, function(err, data) {
			if (data === null) {
				console.log('begining addition to Employee Collection');

				var createEmployee = new employee({
					FirstName: firstName,
					LastName: lastName,
					Email: Email,
					Cell: cell,
					Department: department,
					Admin: false,
					Scheduel: {
						Monday: scheduel[0],
						Tuesday: scheduel[1],
						Wedensday: scheduel[2],
						Thursday: scheduel[3],
						Friday: scheduel[4]
					},
					Username: user_name,
					Password: 'null'
				});

				createEmployee.save((err) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Employee Profile Saved');

						admin = 'userPassword';
						res.render('adminDashboard', { admin, user_name: user_name });
					}
				});
			} else {
				admin = 'addUser';
				errors.push({ msg: 'Username is already taken please pick another' });
				res.render('adminDashboard', {
					errors,
					admin,
					firstName: firstName,
					lastName: lastName,
					user_name: user_name,
					Email: Email,
					department: department,
					cell: cell
				});
				errors.pop();
				// console.log(data);
			}
		});
	});

	//add password post
	app.post('/ABH_ADMIN/PassAdded', urlencodedParser, adminEnsureAuthenticated, (req, res) => {
		const { password1, user_name } = req.body;
		bcrypt.genSalt(10, (err, salt) =>
			bcrypt.hash(password1, salt, (err, hash) => {
				if (err) throw err;

				//set password to hash

				var query = { Username: user_name };
				var update = { Password: hash, PlainPassword: password1 };

				employee.findOneAndUpdate(query, update, (err, doc) => {
					if (err) {
						console.log('err');

						throw err;
					} else {
						// console.log(doc.Password);

						req.flash(
							'success_msg',
							`You succesfully added your password to ${doc.FirstName} ${doc.LastName}'s profile`
						);
						res.redirect('/ABH_ADMIN/Dashboard/');

						// console.log(req.body);
					}
				});
			})
		);
	});

	//remove user get
	app.get('/ABH_ADMIN/Dashboard/removeUser', adminEnsureAuthenticated, (req, res) => {
		admin = 'removeUser';
		res.render('adminDashboard', { admin });
	});

	//remove user post
	app.post('/ABH_ADMIN/Dashboard/removeUser', urlencodedParser, adminEnsureAuthenticated, (req, res) => {
		// console.log(req.body);
		var { username, password1 } = req.body;

		employee
			.findOne({ Username: username })
			.then((empl) => {
				if (!empl) {
					console.log('not found');
					req.flash('error_msg', 'Invalid Username');
					res.redirect('/ABH_ADMIN/Dashboard/removeUser');
				} else {
					//match password
					bcrypt.compare(password1, empl.Password, (err, isMatch) => {
						if (err) console.log(err);

						if (isMatch) {
							employee
								.findOneAndDelete({ Username: username })
								.then(
									req.flash('success_msg', 'User has been REMOVED from ABH Data Base'),
									res.redirect('/ABH_ADMIN/Dashboard/removeUser')
								)
								.catch(() => console.log(err));
						} else {
							req.flash('error_msg', 'Invalid Password');
							res.redirect('/ABH_ADMIN/Dashboard/removeUser');
						}
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	});

	app.get('/ABH_ADMIN/Dashboard/removeVendor', adminEnsureAuthenticated, (req, res) => {
		vendor.find({}).then((vendor) => {
			// console.log(material[1].MaterialName);
			let vendors = new Array();
			for (let i = 0; i < vendor.length; i++) {
				vendors.push(vendor[i].VendorName);
			}

			admin = 'removeVendor';
			res.render('adminDashboard', { admin, vendors });
		});
	});
	app.post('/ABH_ADMIN/Dashboard/removeVendor', urlencodedParser, (req, res) => {
		const { vendorName } = req.body;

		vendor.findOne({ VendorName: vendorName }).then((vend) => {
			let vendMaterial = vend.Material;
			// console.log(vendMaterial[0]);
			for (let i = 0; i < vendMaterial.length; i++) {
				mat.findOne({ MaterialName: vendMaterial[i] }).then((material) => {
					// console.log('this is mat'+material);
					let tempVendArr = material.Vendors;
					// console.log(tempVendArr[0])
					let index = tempVendArr.indexOf(vendorName);
					// console.log(index)
					if (index !== -1) {
						let newVendArr = tempVendArr.splice(index, 1);
						// console.log(newVendArr);
						// console.log(tempVendArr); // we use this because when splicing it takes the value and returns it but the origional array has it removed
						mat
							.findOneAndUpdate({ MaterialName: vendMaterial[i] }, { Vendors: tempVendArr })
							.then((material) => {
								console.log('material updated');
								mat.findOne({ MaterialName: vendMaterial[i] }).then((material) => {
									// console.log(material.Vendors);
									if (material.Vendors[0] === undefined) {
										mat
											.findOneAndDelete({ MaterialName: vendMaterial[i] })
											.then(() =>
												console.log(
													vendMaterial[i] +
														'didnt have anymore vendors so it had been deleted'
												)
											);
									}
								});
							})
							.catch();
						console.log('removed vendor from material');
					}
				});
			}
			vendor
				.findOneAndDelete({ VendorName: vendorName })
				.then(() => {
					console.log('Vendor has been deleted');
					req.flash('success_msg', 'Vendor Has been removed from Data Base');
					res.redirect('/ABH_ADMIN/Dashboard/removeVendor');
				})
				.catch();
		});
	});

	//admin Logout
	app.get('/ABH_ADMIN/logout', (req, res) => {
		req.logout();
		req.flash('success_msg', `You have logged out`);
		admin = 'dashboard';
		res.redirect('/ABH_Admin/Login');
		// disconnectABHPharmaDB();
	});
};

