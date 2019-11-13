module.exports = (imports) => {
	const {
		key,
		jwt,
		bcrypt,
		app,
		passport,
		purchEnsureAuthenticated,
		mat,
		vendor,
		urlencodedParser,
		transporter,
		connectABHPharmaDB,
		disconnectABHPharmaDB
	} = imports;
	let { purchase } = imports;

	///////////////////////////////ABH PURCHASE SITE LOGIN PAGE//////////
	app.get('/CorporationA_Purchase/Login', urlencodedParser, (req, res) => {
		res.render('purchLogin');

	});

	app.post('/Purchase_login', urlencodedParser, (req, res, next) => {
		console.log('SALES Verification Begin...');
		passport.authenticate('purchPass', (errors, staff) => {
			if(errors) {throw errors};
			if (staff === false) {
				console.log('SALES Verification: FAILED');
				req.flash('error_msg','Invalid Credentials');
				res.redirect('/CorporationA_Purchase/Purchase_login');
			} else {
				req.logIn(staff,(err) => {
					if(err) { return next(err);}
					console.log('SALES Verification: PASSED')
					res.redirect('/CorporationA_Purchase/Dashboard');
				})
			}
		})(req, res, next);
	
	});

	///////////////////////////////CorporationA PURCHASE SITE/////////////////////
	// ++ This is to load the categories beginning page
	app.get('/CorporationA_Purchase/Dashboard', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		
		mat.find({}).then((matDoc) => {
			var categories = new Array();
			for (let i = 0; i < matDoc.length; i++) {
				categories.push(matDoc[i]);
			}
			// console.log(materials);
			purchase = 'reqQuote';
			res.render('purchDashboard', { purchase, categories });
		});
	});

	// ++ this is to handle once category has been selected and if new material or only category requests
	app.post('/Category_Request', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		const { masCat, category } = req.body;
		console.log(req.body);
		mat.findOne({ Category: category }).then((matDoc) => {
			let matList = new Array();
			for (let i = 0; i < matDoc.Material.length; i++) {
				matList.push(matDoc.Material[i]);
				// console.log(matDoc.Material[i].MaterialName);
			}
			// console.log(matList)
			// console.log(matList[0].MaterialName)
			// console.log(matList.length);
			purchase = 'materialSelect';
			res.render('purchDashboard', { purchase, matList, masCat, category });
		});
	});

	app.post('/Material_Request', urlencodedParser, purchEnsureAuthenticated, (req, res, next) => {
		const { category, newMat, masCat } = req.body;
		console.log(`New Material: ${newMat} \nMas Cat: ${masCat}`);
		let { material } = req.body;
		material = material.toUpperCase();
		// ^^ possibly change newMaterial to just a ejs if statement in the view  if this isn't used elsewhere
		let newMaterial = 'No';
		if (newMat === 'on') {
			newMaterial = 'Yes';
		}

		console.log('masCat:  ' + masCat === 'on');
		console.log('The material Inputted Was ' + material);
		let badComma = material.indexOf(',', material.length - 1) !== -1;
		let formatPass =
			material.indexOf(' ') === -1 &&
			material.indexOf('_') === -1 &&
			material.indexOf('+') === -1 &&
			material.indexOf(',') === -1 &&
			material.indexOf() === -1;

		console.log('Good comma --> ' + !badComma);
		console.log('Format Pass --> ' + formatPass);

		if (!badComma && formatPass) {
			vendor
				.find({})
				.then((vendorCollection) => {
					mat
						.findOne({ Category: category })
						.then((materialDoc) => {
							let vendorList = new Array();
							let Material = materialDoc.Material;
							let materialIndex = Material.findIndex((dbMaterial) => {
								return dbMaterial.MaterialName === material;
							});
							// First Check if masCat was checked off
							if (masCat === 'on') {
								//now take all the vendors in that category and add them to the list
								console.log('DOES THIS MATERIAL EXIST (CATEGORY REQ) ? ==> ' + (materialIndex !== -1));
								if (materialIndex === -1) {
									req.flash(
										'error_msg',
										`The Material: ${material} does not exist within the database if new material please select the option`
									);
									res.redirect('/CorporationA_Purchase/Dashboard');
								} else {
									console.log(materialIndex);
									for (let i = 0; i < Material.length; i++) {
										let Vendors = Material[i].Vendors;
										for (let j = 0; j < Vendors.length; j++)
											//We are adding the vendor at the index to the list for future reference
											vendorList.push(Vendors[j]);
									}
									purchase ='submitReq'
									res.render('purchDashboard', { purchase, material, newMaterial, vendorList, category });
								}
							} else if (newMat === 'on') {
								//if masCat wasn't checked off we check to see if its a new material
								// ++ MaterialFound is a boolean value of true or false

								console.log('DOES THIS PASS AS A NEW MATERIAL ? ==> ' + (materialIndex === -1));

								if (materialIndex !== -1) {
									req.flash('error_msg', `The Material: ${material} Already Exists CANNOT SEND MASS EMAIL`);
									res.redirect('/CorporationA_Purchase/Dashboard');
								} else {
									for (let i = 0; i < vendorCollection.length; i++) {
										vendorList.push(vendorCollection[i].VendorName);
									}
									purchase ='submitReq'
									res.render('purchDashboard', { purchase, material, newMaterial, vendorList, category });
								}
							} else {
								//if its a specific request because its specific we already have a array value to set the vendor list
								console.log('DOES THIS MATERIAL EXIST (SPECIFIC REQ) ? ==> ' + (materialIndex !== -1));
								if (materialIndex !== -1) {
									vendorList = Material[materialIndex].Vendors;
									purchase ='submitReq'
									res.render('purchDashboard', { purchase, material, newMaterial, vendorList, category });
								} else {
									req.flash(
										'error_msg',
										`The Material: ${material} does not exist within the database if new material please select the option`
									);
									res.redirect('/CorporationA_Purchase/Dashboard');
									
								}
								// console.log(vendorList[0]);
							}
							// console.log(vendorList);
						})
						.catch((err) => {
							throw err;
						});
				})
				.catch((err) => {
					throw err;
				});
		} else {
			req.flash(
				'error_msg',
				'The format for the request was invalid please make sure that There are no spaces and words are separated by dashes and no trailing commas'
			);
			res.redirect('/CorporationA_Purchase/Dashboard');
		}
	});

	app.get('/Purchase_Request', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		res.redirect('/CorporationA_Purchase/Dashboard');
	});

	app.post('/Purchase_Request', urlencodedParser, purchEnsureAuthenticated, (req, res, next) => {
		const { material, reqType, amount, units, price, rushOrder, notes, newMat, category } = req.body;
		let { vendorList } = req.body;
		vendorList = vendorList.split(',');
		
		let newMaterial = newMat === 'Yes';
		let noErr = true;
		const testing = false; // this is for simple testing
		

		if (newMaterial) {
			// ^^This updates the material database by adding a material to the array list of materials for that collection
			mat.findOne({ Category: category }).then((mDoc) => {
				let matArr = mDoc.Material;
				matArr.push({
					MaterialName: material,
					Vendors: []
				});

				console.log(matArr);

				mat
					.findOneAndUpdate({ Category: category }, { Material: matArr })
					.then(() => {
						console.log('Updated ' + category);
					})
					.catch((err) => {
						console.log(err);
					});
			});
		}
		console.log(vendorList);
		console.log('------------------');

		vendor.find({}).then((vDoc) => {
			let vendorCollection = vDoc;
			
			for (let i = 0; i < vendorList.length; i++) {
				let vIndex = vendorCollection.findIndex((doc) => {

					return doc.VendorName === vendorList[i];
				});
				let vendorDoc = vendorCollection[vIndex];
				console.log(vIndex)
				console.log('the vendor ' + vendorList[i])
				console.log(vendorDoc.VendorName);
				console.log(vendorDoc.Email.main)
				console.log(vendorDoc.Email.cc);
				let vendorId = vendorDoc._id;
				console.log(`id: ${vendorId}`);
				var orderType = rushOrder;
				var targetPrice = price;

				if ((orderType = 'on')) {
					orderType = 'Rush Order';
				} else {
					orderType = 'Order';
				}

				if (targetPrice != '') {
					targetPrice = `Our target price would preferably be ${price} $(USD)`;
				}
				console.log(key.jwtSecret)
				var token = jwt.sign(
					{
						vendorName: vendorDoc.VendorName,
						shipCompName: vendorDoc.shipCompName,
						shipAddress1: vendorDoc.shipAddress1,
						shipAddress2: vendorDoc.ShipAddress2,
						shipCity: vendorDoc.shipCity,
						shipState: vendorDoc.shipState,
						shipZip: vendorDoc.shipZip,
						shipCountry: vendorDoc.shipCountry,
						newMaterial: newMaterial,
						rushOrder: rushOrder,
						targetPrice: targetPrice,
						material: material,
						category: category,
						orderType: orderType,
						abhRequest: `${orderType} Of ${amount} ${units}: ${reqType}`
					},
					key.jwtSecret,
					{
						expiresIn: '7 days'
					}
				);

				// console.log(token);
				let vendorKeys = [ ...vendorDoc.key, token ];

				vendor
					.findByIdAndUpdate(vendorId, { key: vendorKeys })
					.then(() => console.log('Updated tokens for  Vendor ' + vend.VendorName))
					.catch((err) => {
						err ? err : 'no err';
					});

				var vendorName = vendorDoc.VendorName;
				//  console.log(vend.VendorName);
				// var shipCompName = vend.shipCompName;
				//  console.log(shipCompName);
				// var shipAddress1 = vend.shipAddress1;
				// const shipAddress2 = vend.ShipAddress2;
				// const shipCity = vend.shipCity;
				// const shipState = vend.shipState;
				// const shipZip = vend.shipZip;
				// const shipCountry = vend.shipCountry;
				// const matNew = newMaterial;

				const mailOptionsReq = {
					from: 'CorporationA Purchase Dept. <hashmatibrahimi0711@gmail.com>', // sender address
					to:	vendorDoc.Email.main, // list of receivers
					cc: vendorDoc.Email.cc,
					//${vendorContact[i]},
					subject: `CorporationA Quote Request for ${material} `, // Subject line
					text: `
									Hello ${vendorName}, <br>
									CorporationA has decided to use the following link to source pricing for materials. Should there be any issues please feel free to contact us directly at Purchasing@CorporationA.com 
									<br>
									<br>

									We at CorporationA have requested a quote for the following material: ${material}
									<br><br>

									${targetPrice}<br>
									Notes: ${notes}<br><br>


									Attached to this email is a link that will allow you to send us your quote. This link will expire in 5 Days or once you submit the form.


									<br><br><br><br><br><br>

									We at CorporationA Appreciate your business with us and hope to hear from you soon.

									<br><br>
									The information contained in this communication is confidential, may be privileged and is intended for the exclusive use of the above named addressee(s). If you are not the intended recipient(s), you are expressly prohibited from copying, distributing, disseminating, or in any other way using any information contained within this communication. If you have received this communication in error please contact the sender by telephone or by response via mail. We have taken precautions to minimize the risk of transmitting software viruses, but we advise you to carry out your own virus checks on any attachment to this message. We cannot accept liability for any loss or damage caused by software virus. <br>
									

									<br><br>
									https://sourcing-app-v01.herokuapp.com/Invoice_Form/?vend=${vendorName}&tok=${token}


									<br><br>

									If you do not supply this material and want to be removed from the email chain please click the following link <br>
									https://sourcing-app-v01.herokuapp.com/Do_Not_Supply/?vend=${vendorName}&tok=${token}

									`,
					html: `
									Hello ${vendorName}, <br>
									Corporation A has decided to use the following link to source pricing for materials. Should there be any issues please feel free to contact us directly at Purchasing@CorporationA.com 
									<br><br>


									We at CorporationA have requested a quote for the following material: ${material}
									<br><br>

									${targetPrice}<br>
									Notes: ${notes}<br><br>

									<br>

									Attached to this email is a link that will allow you to send us your quote. This link will expire in 5 Days or once you submit the form.


									<br><br><br><br><br><br>

									We at CorporationA Appreciate your business with us and hope to hear from you soon.

									<br><br>
									The information contained in this communication is confidential, may be privileged and is intended for the exclusive use of the above named addressee(s). If you are not the intended recipient(s), you are expressly prohibited from copying, distributing, disseminating, or in any other way using any information contained within this communication. If you have received this communication in error please contact the sender by telephone or by response via mail. We have taken precautions to minimize the risk of transmitting software viruses, but we advise you to carry out your own virus checks on any attachment to this message. We cannot accept liability for any loss or damage caused by software virus. <br>
									
									<br><br>

									<a href = "https://sourcing-app-v01.herokuapp.com/Invoice_Form/?vend=${vendorName}&tok=${token}">Invoice Form<a>


									<br><br>

									If you do not supply this material and want to be removed from the email chain please click the following link <br>
									List-Unsubscribe: <mailto: emailAddress>, <unsubscribe URL > <a href = "https://sourcing-app-v01.herokuapp.com/Do_Not_Supply/?vend=${vendorName}&tok=${token}">Unsubscribe<a>
									`
				};
				//localHost:5000
				//app.CorporationApharma.com
				transporter
					.send(mailOptionsReq)
					.then((info) => {
						console.log('Sent Email to ' + vendorList[i]);
					})
					.catch((err) => {
						console.log('there is a err sending to ' + vendorList[i] + ' code err:', err);
						noErr = false;
					});
			}
		});

		if (noErr == true) {
			if (newMaterial) {
				req.flash('success_msg', `Request Has Been Sent TO ALL VENDORS`);
				res.redirect('/CorporationA_Purchase/Dashboard');
			} else {
				req.flash('success_msg', `Request Has Been Sent`);
				res.redirect('/CorporationA_Purchase/Dashboard');
			}
		} else {
			if (newMaterial) {
				req.flash(
					'error_msg',
					`ERROR REQUEST HAD PROBLEMS TO ALL VENDORS *** Please Contact Dev Department ***`
				);
				res.redirect('/CorporationA_Purchase/Dashboard');
			} else {
				req.flash('error_msg', `ERROR REQUEST HAD PROBLEMS  *** Please Contact Dev Department ***`);
				res.redirect('/CorporationA_Purchase/Dashboard');
			}
		}
	});

	// ++ Edit vendor Information
	app.get('/CorporationA_Purchase/Modify_Vendor', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		vendor
			.find({})
			.then((vendor) => {
				// console.log(material[1].MaterialName);
				var vendorName = [];
				for (let i = 0; i < vendor.length; i++) {
					vendorName.push(vendor[i].VendorName);
				}

				purchase = 'modVend';
				res.render('purchDashboard', { purchase, vendorName });
			})
			.catch();
	});

	app.post('/Modify_Vendor', urlencodedParser, purchEnsureAuthenticated, (req, res, next) => {
		const vendSearch = req.body.vendSearch;
		purchase = 'vendInfoPull';
		vendor.findOne({ VendorName: vendSearch }).then((vendor) => {
			if (vendor === null) {
				req.flash(
					'error_msg',
					'It seems like you picked a vendor that is not in the system please use the list of vendors in the search box'
				);
				res.redirect('/CorporationA_Purchase/Modify_Vendor');
			} else {
				const vendNam = vendor.VendorName;
				const repNam = vendor.RepName;
				const website = vendor.Website;

				const vendEmail = vendor.Email.main;
				const vendCC = vendor.Email.cc;
				const vendNum = vendor.Number;
				const shipCompNam = vendor.shipCompNam;
				const shipAddress1 = vendor.shipAddress1;
				const shipAddress2 = vendor.shipAddress2;
				const shipCity = vendor.shipCity;
				const shipState = vendor.shipState;
				const shipZip = vendor.shipZip;
				const shipCountry = vendor.shipCountry;
				//    console.log(matSup);

				res.render('purchDashboard', {
					purchase,
					vendNam,
					repNam,
					website,
					vendCC,
					vendEmail,
					vendNum,
					shipCompNam,
					shipAddress1,
					shipAddress2,
					shipCity,
					shipState,
					shipZip,
					shipCountry
				});
			}
		});
	});

	app.post('/vendInfoModify', urlencodedParser, purchEnsureAuthenticated, (req, res, next) => {
		let {
			vendNam,
			repName,
			website,
			vendEmail,
			vendEmailCC,
			vendNum,
			shipCompNam,
			shipAddress1,
			shipAddress2,
			shipCity,
			shipState,
			shipZip,
			shipCountry
		} = req.body;

		console.log(req.body);
		// console.log(matSup);
		// console.log(vendNam);
		vendNam = vendNam.toUpperCase();
		repName = repName.toUpperCase();
		website = website.toUpperCase();
		// matSup = matSup.toUpperCase();
		vendEmail = vendEmail.toUpperCase();

		vendEmailCC = vendEmailCC.toUpperCase();
		vendEmailCC = vendEmailCC.split(',');

		shipCompNam = shipCompNam.toUpperCase();
		shipAddress1 = shipAddress1.toUpperCase();
		shipAddress2 = shipAddress2.toUpperCase();
		shipCity = shipCity.toUpperCase();
		shipState = shipState.toUpperCase();

		shipCountry = shipCountry.toUpperCase();
		var matArray = new Array();

		// console.log(matArray);
		var query = { VendorName: vendNam }; // takes the readOnly value of vendNam from purchasePartial and then applies it the query

		var update = {
			VendorName: vendNam,
			RepName: repName,
			Website: website,
			// Material: matArray,
			Email: {
				main: vendEmail,
				cc: vendEmailCC
			},
			Number: vendNum,
			shipCompNam: shipCompNam,
			shipAddress1: shipAddress1,
			shipAddress2: shipAddress2,
			shipCity: shipCity,
			shipState: shipState,
			shipZip: shipZip,
			shipCountry: shipCountry
		};

		//this is to update the vendor doc
		vendor
			.findOneAndUpdate(query, update)
			.then((vendor) => {
				// this just updates the document of the vendor whether it has or doesn't have the material in the list that is found not the material

				req.flash('success_msg', `You successfully updated Vendor: ${vendNam}'s Info`);
				res.redirect('/CorporationA_Purchase/Modify_Vendor');
			})
			.catch((err) => {
				console.log(err);
			});
	});

	// ++Add vendor to database 
	app.get('/CorporationA_Purchase/Add_Vendor', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		mat.find({}).then((material) => {
			var materials = [];
			// console.log(material.length);
			for (let i = 0; i < material.length; i++) {
				materials.push(material[i].MaterialName);
			}

			purchase = 'addVend';
			// console.log(materials);
			res.render('purchDashboard', { purchase, materials });
		});
	});

	app.post('/Add_Vendor', urlencodedParser, purchEnsureAuthenticated, (req, res, next) => {
		let {
			vendNam,
			repName,
			website,
			vendEmail,
			vendEmailCC,
			vendNum,
			shipCompNam,
			shipAddress1,
			shipAddress2,
			shipCity,
			shipState,
			shipZip,
			shipCountry,
			notes
		} = req.body;
		vendNam = vendNam.toUpperCase();
		repName = repName.toUpperCase();
		website = website.toUpperCase();
		vendEmail = vendEmail.toUpperCase();
		vendEmailCC = vendEmailCC.toUpperCase();
		shipCompNam = shipCompNam.toUpperCase();
		shipAddress1 = shipAddress1.toUpperCase();
		shipAddress2 = shipAddress2.toUpperCase();
		shipCity = shipCity.toUpperCase();
		shipState = shipState.toUpperCase();

		shipCountry = shipCountry.toUpperCase();

		// console.log(matArr);

		// console.log(matArray);

		vendor.findOne({ VendorName: vendNam }, function(err, data) {
			if (data === null) {
				console.log('beginning addition to Vendor Collection');

				bcrypt.genSalt(10, (err, salt) =>
					bcrypt.hash('PharmaDebug!54', salt, (err, hash) => {
						if (err) throw err;
						let hashKey = {
							HashKey: hash,
							Material: 'Debug Material',
							EXP_Date: Date()
						};
						var createVendor = new vendor({
							VendorName: vendNam,
							RepName: repName,
							Email:{
								main: vendEmail,
								cc: vendEmailCC	
							},
							Number: vendNum,
							Website: website,
							Admin: false,

							shipCompName: shipCompNam,
							shipAddress1: shipAddress1,
							shipAddress2: shipAddress2,
							shipCity: shipCity,
							shipState: shipState,
							shipZip: shipZip,
							shipCountry: shipCountry,
							Notes: notes,
							key: hashKey
						});

						createVendor.save((err) => {
							if (err) {
								console.log(err);
							} else {
								console.log('Vendor Profile Saved');

								req.flash('success_msg', 'Vendor Profile Has Been Saved');
								res.redirect('/CorporationA_Purchase/Add_Vendor');
							}
						});
					})
				);
			} else {
				purchase = 'addVend';
				req.flash(
					'error_msg',
					'Vendor is already in the Database if you want to modify vendor go to Modify Vendor Info Page'
				);
				res.redirect('/CorporationA_Purchase/Add_Vendor');

				// console.log(data);
			}
		});
	});

	////////////////////////////////////////////////////////////////////////////TODO:
	// ++ Modify vendor materials 
	app.get('/CorporationA_Purchase/Modify_Material', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		vendor.find({}).then((doc) => {
			let vendorName = new Array();
			for (let i = 0; i < doc.length; i++) {
				vendorName.push(doc[i].VendorName);
			}
			// console.log(vendorName);

			purchase = 'mat_Vend_Select';
			res.render('purchDashboard', { purchase, vendorName });
		});
	});

	app.post('/Vendor_Info_Pull', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		const { vendSearch, newCat } = req.body;
		if (newCat == 'on') {
			mat.find({}).then((doc) => {
				let catSearch = new Array();
				for (let i = 0; i < doc.length; i++) {
					catSearch.push(doc[i].Category);
				}
				// console.log(catSearch);
				purchase = 'add_Category_Vendor';
				res.render('purchDashboard', { purchase, vendSearch, catSearch });
			});
		} else {
			vendor.findOne({ VendorName: vendSearch }).then((doc) => {
				if (doc === null) {
					console.log('doc not Found');
					req.flash(
						'error_msg',
						' Looks like the vendor does not exists if this was not a typo go to the add vendor page'
					);
					res.redirect('/CorporationA_Purchase/Modify_Material');
				} else {
					let catSearch = new Array();
					// console.log(doc.Categories.length);
					for (let i = 0; i < doc.Categories.length; i++) {
						catSearch.push(doc.Categories[i].CategoryName);
					}
					// console.log(catSearch);
					purchase = 'mat_Cat_Select';
					res.render('purchDashboard', { purchase, vendSearch, catSearch });
				}
			});
		}
	});

	// ++ Add a category to vendor for materials 
	app.post('/Add_Category_Vendor', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		let { catAddition, vendSearch } = req.body;

		let catModel = {
			CategoryName: catAddition,
			Materials: []
		};

		vendor.findOne({ VendorName: vendSearch }).then((doc) => {
			// console.log(vendSearch);
			let arr = new Array();
			let isExist = doc.Categories.findIndex((Category) => {
				return Category.CategoryName === catAddition;
			});
			isExist = isExist !== -1;
			// console.log(isExist);
			if (!isExist) {
				vendor
					.findOneAndUpdate({ VendorName: vendSearch }, { $push: { Categories: catModel } })
					.then((doc) => {
						req.flash('success_msg', 'Category: ' + catAddition + ' was added to ' + vendSearch);
						res.redirect('/CorporationA_Purchase/Modify_Material');
						console.log('added category to vendor');
					})
					.catch((err) => {
						console.log(err);
					});
			} else {
				req.flash('error_msg', 'Category: ' + catAddition + ' already exists under the Vendor ' + vendSearch);
				res.redirect('/CorporationA_Purchase/Modify_Material');
			}
		});
	});

	app.post('/Vendor_Category_Pull', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		const { vendSearch, catSearch } = req.body;
		vendor.findOne({ VendorName: vendSearch }).then((doc) => {
			let catIndex = doc.Categories.findIndex((Categories) => {
				return Categories.CategoryName === catSearch;
			});

			if (catIndex === -1) {
				req.flash(
					'error_msg',
					'Please select the categories listed OR if you want to add a category to the vendor check the add category to vendor option'
				);
				res.redirect('/CorporationA_Purchase/Modify_Material');
			} else {
				let materialList = new Array();
				let dbMaterialArr = doc.Categories[catIndex].Materials;
				for (let i = 0; i < dbMaterialArr.length; i++) {
					materialList.push(dbMaterialArr[i]);
					// materialList.push('TestMaterial'+[i])
				}
				let materialListTemp = materialList;
				materialList = materialList.join(',\n');
				// console.log(materialList,vendSearch,catSearch)
				// console.log(materialList);
				purchase = 'mat_Vendor_Update';
				res.render('purchDashboard', { purchase, materialList, vendSearch, catSearch, materialListTemp });
			}
		});
	});

	// ++Finalize material support and update material and vendor db
	app.post('/Update_Material_Push', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		const { vendSearch, catSearch } = req.body; // these reference the vendors name and category to search for to modify
		let { materialList, materialListTemp } = req.body; // this is the temporary list to compare to the new list to see what was added and what was removed

		let errors = new Array();

		function formatValidation(myArr) {
			let listValid = true;
			for (let i = 0; i < myArr.length; i++) {
				let test =
					myArr[i].indexOf(' ') === -1 &&
					myArr[i].indexOf('_') === -1 &&
					myArr[i].indexOf('+') === -1 &&
					myArr[i].indexOf(',') === -1 &&
					myArr[i].indexOf() === -1;

				if (test === false) {
					console.log(myArr[i] + ' is ' + 'INVALID FORMAT');
					listValid = false;
					break;
				}
			}
			return listValid;
		}

		// printout if it passed 2nd stage input verification
		// console.log(materialList);
		// make both the temporary list and new list capitalized so that only the word is compared not the letter case
		materialList = materialList.toUpperCase();
		materialListTemp = materialListTemp.toUpperCase();

		//remove white space after the all the materials
		materialList = materialList.trim();

		let badComma = materialList.indexOf(',', materialList.length - 1) !== -1;
		console.log(badComma + ' bad comma');

		// use commas ',' to divide the lists and make a array
		if (materialList !== '') {
			materialList = materialList.split(',');
		}
		materialListTemp = materialListTemp.split(',');
		// console.log('this is now before validation ', materialList);
		//this is to prepare the list to be updated by replacing all the html tags that display the list in the textarea like tab(\r) and line brakes(\n) or both
		for (let i = 0; i < materialList.length; i++) {
			materialList[i] = materialList[i].replace(/(\r\n|\n|\r)/gm, '');
		}

		let formatPass = formatValidation(materialList); // this is to check to see if there are any : Spaces, extra commas,or underscore to separate multi-word Materials
		// console.log(formatPass);

		//if the format that was entered does not passes the second stage of checking then ...
		if (!formatPass || badComma) {
			errors.push({
				msg:
					'Please Separate materials by a comma and then press enter for a new line, Make sure there are no commas at the last material, and use a "-" instead of a space'
			});
			purchase = 'mat_Vendor_Update';
			res.render('purchDashboard', {
				purchase,
				materialList,
				materialListTemp,
				vendSearch,
				catSearch,
				errors
			});
		} else {
			//if the format passes the first stage then enter ....
			let tMat = materialListTemp;
			// console.log(materialListTemp);
			//this is to check what the result is
			// console.log('this is now ', materialList);

			/////////////////////////////////DO NOT TOUCH THE FUNCTIONS BELOW THEY WORK AND LEAVE IT THAT WAY //////////////////////////////////////////

			// console.log('this is before ', tMat);

			// create materialPop and materialAdd arrays to use later to decide what to remove and what to add
			let materialPop = new Array();
			let materialAdd = new Array();
			//if something was added or removed then push it to either the material to pop array or material to add array ....
			if (tMat[0] === '' || tMat[0] === '') {
				for (let i = 0; i < materialList.length; i++) {
					if (tMat.includes(materialList[i]) == false) {
						materialAdd.push(materialList[i]);
					}
				}
			} else {
				for (let i = 0; i < tMat.length; i++) {
					if (materialList.includes(tMat[i]) == false) {
						materialPop.push(tMat[i]);
					}
				}
				for (let i = 0; i < materialList.length; i++) {
					if (tMat.includes(materialList[i]) == false) {
						materialAdd.push(materialList[i]);
					}
				}
			}

			// console.log(
			// (materialAdd[0] !== undefined && materialAdd[0] !== '') ||
			// (materialPop[0] !== undefined && materialPop[0] !== '')
			// );
			console.log('Material Was ADDED : ' + (materialAdd[0] !== undefined && materialAdd[0] !== ''));
			console.log('Material Was REMOVED : ' + (materialPop[0] !== undefined && materialPop[0] !== ''));
			//check if anything was added or removed if it was then proceed

			if (
				(materialAdd[0] !== undefined && materialAdd[0] !== '') ||
				(materialPop[0] !== undefined && materialPop[0] !== '')
			) {
				console.log('This is whats been added ' + materialAdd);
				console.log('This is whats been removed ' + materialPop);
				// console.log(materialPop[0] == undefined);
				// console.log(materialPop[0] == null);
				// console.log(materialPop[0] == '');

				//This section updated the vendor profile ::: TODO: DATE MODIFIED COMPLETION APRIL 15, 2019 TODO:
				vendor
					.findOne({ VendorName: vendSearch })
					.then((doc) => {
						let tempCat = new Array();
						for (let i = 0; i < doc.Categories.length; i++) {
							tempCat.push(doc.Categories[i]);
						}

						console.log(tempCat); // this is to log the category array as a reference

						// this returns the index of the category array that matches with the category we want to edit
						let index = tempCat.findIndex((Categories) => {
							return Categories.CategoryName === catSearch;
						});

						console.log(index); // this is to log the value of index to check if its right

						//This portion removes the removed values from the arr
						for (let i = 0; i < materialPop.length; i++) {
							let popI = tempCat[index].Materials.indexOf(materialPop[i]);

							tempCat[index].Materials.splice(popI, 1);
						}
						// console.log(tempCat);

						//This portion adds the added values from the arr
						for (let i = 0; i < materialAdd.length; i++) {
							let materialExist = false;
							let tDoc = doc.Categories;
							let catLength = tDoc.length;
							let categoryMatExist;
							// console.log(tDoc);
							for (let k = 0; k < catLength; k++) {
								let materialArr = tDoc[k].Materials;
								// console.log(materialArr);
								for (let j = 0; j < materialArr.length; j++) {
									if (materialArr[j] === materialAdd[i]) {
										materialExist = true;
										categoryMatExist = tDoc[k].CategoryName;
										errors.push({
											msg:
												'Material: ' +
												materialAdd[i] +
												' already exist in the ' +
												categoryMatExist
										});
										purchase = 'mat_Vendor_Update';
										res.render('purchDashboard', {
											purchase,
											materialList,
											materialListTemp,
											vendSearch,
											catSearch,
											errors
										});
										console.log('why are you adding another material to this');
										break;
									} else {
										console.log('Material Not found in other categories and is good for addition');
									}
								}
							}

							if (materialExist === false) {
								tempCat[index].Materials.push(materialAdd[i]);
							}
						}

						console.log(tempCat); // console log the resulting new category for upload

						vendor
							.findOneAndUpdate({ VendorName: vendSearch }, { Categories: tempCat })
							.then((doc) => {
								console.log('Updated the vendors Material profile');
								// req.flash('success_msg', 'Database Was Successfully Updated');
								// res.redirect('/CorporationA_Purchase/Modify_Material');
							})
							.catch((err) => {
								console.log(err);
							});
					})
					.then(() => {
						req.flash('success_msg', 'Database Successfully Updated');
						res.redirect('/CorporationA_Purchase/Modify_Material');
					})
					.catch((err) => {
						console.log(err);
					});
				/////////////////////////////////////////////////////////////////////////////////////////////////TODO: COMPLETED APRIL 18TH 2019

				//This section is to update the material document that houses the Categories => Materials => Vendors who supply the material
				// console.log(tMat[0] === '' || tMat[0] === undefined);
				mat
					.findOne({ Category: catSearch })
					.then((doc) => {
						// console.log(catSearch);
						// console.log(doc);
						if (materialAdd[0] !== undefined && materialAdd[0] !== '') {
							if (tMat[0] === '') {
								let matArr = doc.Material;
								let categoryMatExist;
								let materialExist = false;
								mat
									.find({})
									.then((totalDoc) => {
										for (let i = 0; i < materialAdd.length; i++) {
											let tDoc = totalDoc;
											let catLength = tDoc.length;
											// console.log(tDoc);
											for (let k = 0; k < catLength; k++) {
												let materialArr = tDoc[k].Material;
												// console.log(materialArr);
												for (let j = 0; j < materialArr.length; j++) {
													if (materialArr[j].MaterialName === materialAdd[i]) {
														materialExist = true;
														categoryMatExist = tDoc[k].Category;
														errors.push({
															msg:
																'Material: ' +
																materialAdd[i] +
																' already exist in the ' +
																categoryMatExist
														});
														purchase = 'mat_Vendor_Update';
														res.render('purchDashboard', {
															purchase,
															materialList,
															materialListTemp,
															vendSearch,
															catSearch,
															errors
														});
														console.log(
															'why are you adding another material to this AABBAA'
														);
														break;
													} else {
														console.log(
															'Material Not found in other categories and is good for addition'
														);
													}
												}
											}

											if (materialExist === false) {
												let newMaterialUpload = {
													MaterialName: materialAdd[i],
													Vendors: [ vendSearch ]
												};
												matArr.push(newMaterialUpload);
											} else {
											}
										}
										mat
											.findOneAndUpdate({ Category: catSearch }, { Material: matArr })
											.then((doc) => {
												console.log('Just added a new material to ' + catSearch);
											})
											.catch((err) => {
												console.log('There is a problem with the addition of new material');
											});
									})
									.catch((err) => {
										console.log('error looking up total list' + err);
									});
							} else {
								let matArr = doc.Material;
								let materialExist = false;
								let categoryMatExist;
								mat
									.findOne({ Category: catSearch })
									.then((tempp) => {
										for (let i = 0; i < materialAdd.length; i++) {
											let matIndex = matArr.findIndex((mat) => {
												return mat.MaterialName === materialAdd[i];
											});

											//if the material exist go into the next layer
											if (matIndex !== -1) {
												let vendIndex = matArr[matI].Vendors.findIndex((vend) => {
													return vend === vendSearch;
												});
												// console.log(vendIndex);

												if (vendIndex === -1) {
													matArr[matIndex].Vendors.push(vendSearch);
												} else {
													errors.push({
														msg:
															'Material Addition Error :  The vendor Already Exists in for this material: ' +
															materialAdd[i]
													});
													purchase = 'mat_Vendor_Update';
													res.render('purchDashboard', {
														purchase,
														materialList,
														materialListTemp,
														vendSearch,
														catSearch,
														errors
													});
													break;
												}
											} else {
												mat
													.find({})
													.then((totalDoc) => {
														let tDoc = totalDoc;
														let catLength = tDoc.length;

														for (let n = 0; n < catLength; n++) {
															let materialArr = tDoc[n].Material;

															for (let j = 0; j < materialArr.length; j++) {
																if (materialArr[j].MaterialName === materialAdd[i]) {
																	materialExist = true;
																	categoryMatExist = tDoc[n].Category;
																} else {
																	let newMaterial = {
																		MaterialName: materialAdd[i],
																		Vendors: vendSearch
																	};
																	matArr.push(newMaterial);
																	// console.log(matArr);
																}
															}
														}
													})
													.then(() => {
														if (materialExist === false) {
															console.log(
																matArr + ' ------------ this is final material'
															);
															mat
																.findOneAndUpdate(
																	{ Category: catSearch },
																	{ Material: matArr }
																)
																.then((doc) => {
																	console.log('updated material');
																})
																.catch((err) => {
																	console.log(err);
																});
														} else {
															errors.push({
																msg:
																	'This Material already exist in the ' +
																	categoryMatExist
															});
															purchase = 'mat_Vendor_Update';
															res.render('purchDashboard', {
																purchase,
																materialList,
																materialListTemp,
																vendSearch,
																catSearch,
																errors
															});
														}
													});
											}
										}
									})
									.then((doc) => {})
									.catch((err) => {
										console.log('ALPHA12300' + err);
									});
							}
						}

						if (materialPop[0] !== undefined && materialPop[0] !== '') {
							mat
								.findOne({ Category: catSearch })
								.then((doc) => {
									let matArr = doc.Material;
									for (let i = 0; i < materialPop.length; i++) {
										let matIndex = matArr.findIndex((material) => {
											return material.MaterialName === materialPop[i];
										});
										console.log('');

										console.log(
											'Before any Changes -------------------------------------------****'
										);

										console.log('');

										console.log(matArr);
										let vendIndex = matArr[matIndex].Vendors.indexOf(vendSearch);

										matArr[matIndex].Vendors.splice(vendIndex, 1);

										console.log('');

										console.log(
											'After any Changes -------------------------------------------****'
										);

										console.log('');

										console.log(matArr);

										console.log('');

										let emptyMaterial = matArr[matIndex].Vendors[0] === undefined;
										if (emptyMaterial) {
											console.log(
												'After any Deletion -------------------------------------------****'
											);

											console.log('');

											matArr.splice(matIndex, 1);

											console.log(matArr);
										}
									}

									mat
										.findOneAndUpdate({ Category: catSearch }, { Material: matArr })
										.then((doc) => {
											console.log(
												'deleted material ' +
													materialPop[i] +
													' because it had no vendors that support it'
											);
										})
										.catch((err) => {
											err;
										});

									console.log('');
									console.log('');
								})
								.catch((err) => {
									console.log(err);
								});
						}
					})
					.catch((err) => {
						console.log(err);
					});
			} else {
				// if nothing was added or removed then ....
				req.flash('error_msg', 'Nothing Was Changed');
				res.redirect('/CorporationA_Purchase/Modify_Material');
			}
		}
	});

	/////////////////////////////////////////////////////////////////////////////////TODO:

	app.get('/CorporationA_Purchase/Add_Category', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		purchase = 'addCat';
		res.render('purchDashboard', { purchase });
	});

	app.post('/Add_Category', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		let { categoryIn } = req.body;
		categoryIn = categoryIn.toUpperCase();
		mat
			.find({ Category: categoryIn })
			.then((matList) => {
				if (matList[0] === undefined) {
					let doc = new mat({
						Category: categoryIn
					});
					doc.save((err) => {
						if (err) {
							console.log(err);
						} else {
							req.flash(
								'success_msg',
								'You Have Created Category:  ' +
									categoryIn +
									', If there was a spelling issue you may change it quickly in the modify category page'
							);
							res.redirect('/CorporationA_Purchase/Add_Category');
							console.log('Created Category:    ' + categoryIn);
						}
					});
				} else {
					req.flash('error_msg', 'This Category Already Exists');
					res.redirect('/CorporationA_Purchase/Add_Category');
					console.log('category exists');
				}
			})
			.catch(() => {
				console.log('There was a error in the query');
			});
	});

	////////////////////////////////////////////////////////////////////////////

	app.get('/CorporationA_Purchase/Modify_Category', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		mat.find({}).then((doc) => {
			let docNoMat = new Array();
			for (let i = 0; i < doc.length; i++) {
				let material = doc[i].Material[0];
				if (material === undefined) {
					docNoMat.push(doc[i].Category);
				}
			}
			// console.log(doc[2].Material[0] === undefined);
			// console.log(docNoMat);
			purchase = 'modCat';
			res.render('purchDashboard', { purchase, docNoMat });
		});
	});

	app.post('/Modify_Category', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		purchase = 'modCatSub';
		const { catSearch } = req.body;
		res.render('purchDashboard', { purchase, catSearch });
	});

	app.post('/Modify_Category_Submit', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		let { catSearch, catChange } = req.body;
		catChange = catChange.toUpperCase();
		mat.findOneAndUpdate({ Category: catSearch }, { Category: catChange }).then(() => {
			console.log('Category: ' + catSearch + ' has been changed to ' + catChange);
			req.flash('success_msg', 'Category: ' + catSearch + ' has been changed to ' + catChange);
			res.redirect('/CorporationA_Purchase/Modify_Category').catch((err) => {
				console.log(err);
			});
		});
	});

	app.get('/Modify_Category_Submit', urlencodedParser, purchEnsureAuthenticated, (req, res) => {
		res.redirect('/CorporationA_Purchase/Modify_Category');
	}); ////////////////////////////////////////////////////////////////////////////

	app.get('/CorporationA_Purchase/Logout', (req, res) => {
		req.logout();
		req.flash('success_msg', `You have logged out`);
		res.redirect('/CorporationA_Purchase/Login');
		// disconnectCorporationAPharmaDB();
	});
};
