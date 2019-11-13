/////////////////////////////////////////Export////////////////////////////////////

module.exports = {
	docManipEnable,
	dbAddToEmployee,
	connectABHPharmaDB,
	disconnectABHPharmaDB,
	passwordENCRYPT
};
/////////////////////////////////////////Require////////////////////////////////////
const key = process.env;
var Employee = require('./models/Employee');
var Vendor = require('./models/Vendor');
var Material = require('./models/Material');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var employee = Employee.Employee;
var material = Material.Material;
var vendor = Vendor.Vendor;

/////////////////////////////////////////Connection Functions////////////////////////////////////

//CLEAR
function connectABHPharmaDB(theFunction) {
	mongoose
		.connect(key.ABHPHARMA_DB_CONNECT_URI, { useNewUrlParser: true })
		.then(() => theFunction, console.log('Connected to ABH Pharma DB.....'))
		.catch((err) => console.log(err));
}

//Disconnect to DB

//CLEAR
function disconnectABHPharmaDB() {
	mongoose
		.disconnect(key.ABHPHARMA_DB_CONNECT_URI)
		.then(() => console.log('Disconnected From ABH Pharma DB.....'))
		.catch((err) => console.log(err));
}

/////////////////////////////////////////Searching Employee Collection Functions////////////////////////////////////

//searches for EMPLOYEE collection by passing the key value u want then sends it back as a json object that you can search throught using the object.<key value>
// function searchEmployeeBy_FirstName(collection, keyValue){
//     return collection.find({FirstName : keyValue},function(err,data){
//         if(err) throw err;
//         var dat1 = {data};
//         console.log(dat1);
//     })
// }                                                                                    This is just a referance of how i originally wantes this function to work

//CLEAR
function searchEmployeeBy_FirstName(firstName) {
	employee.find({ FirstName: firstName }, function(err, data) {
		if (err) throw err;
		var info = docManipEnable({ data });
		console.log(info.Cell); // info.(whatever the key is in mongoDB)
	});
}
//CLEAR
function searchEmployeeBy_LastName(lastName) {
	return employee.find({ LastName: lastName }, function(err, data) {
		if (err) throw err;
		var info = docManipEnable({ data });
		console.log(info.Scheduel); // info.(whatever the key is in mongoDB)
	});
}
//CLEAR
function searchEmployeeBy_UserName(userName) {
	connectABHPharmaDB();
	employee.find({ Username: userName }, function(err, data) {
		if (err) throw err;
		var info = docManipEnable({ data });
		console.log(info); // info.(whatever the key is in mongoDB)
		disconnectABHPharmaDB();
	});
}
//CLEAR
function searchEmployeeBy_Email(email) {
	return employee.find({ Email: email }, function(err, data) {
		if (err) throw err;
		var info = docManipEnable({ data });
		console.log(info.Admin); // info.(whatever the key is in mongoDB)
	});
}
//CLEAR
function searchEmployeeBy_Cell(cellphone) {
	return employee.find({ Cell: cellphone }, function(err, data) {
		if (err) throw err;
		var info = docManipEnable({ data });
		console.log(info); // info.(whatever the key is in mongoDB)
	});
}

/////////////////////////////////////////Searching Material Collection Functions////////////////////////////////////

//searches for MATERIAL collection by passing the key value u want then sends it back as a json object that you can search throught using the object.<key value>

function searchMaterialBy_Material(materialName) {
	return material.find({ MaterialName: materialName }, function(err, data) {
		if (err) throw err;
		var info = docManipEnable({ data });
		console.log(info); // info.(whatever the key is in mongoDB)
	});
}

/////////////////////////////////////////Searching Vendor Collection Functions////////////////////////////////////

//searches for MATERIAL collection by passing the key value u want then sends it back as a json object that you can search throught using the object.<key value>

function searchVendorBy_VendorName(vendorName) {
	vendor.find({ VendorName: vendorName }, function(err, data) {
		if (err) throw err;
		var info = docManipEnable({ data });
		console.log(info); // info.(whatever the key is in mongoDB)
	});
}

/////////////////////////////////////////DB Reading Functions////////////////////////////////////

//make enable to manipulate
function docManipEnable(data) {
	var user = JSON.stringify(data);
	var start = 9;
	var end = user.length - 2;
	var sliceString = user.slice(start, end);
	return JSON.parse(sliceString);
}

/////////////////////////////////////////Adding to DB Functions////////////////////////////////////

function createEmployee(firstname, lastname, email, cell, department, admin, scheduel, username, password) {
	console.log('begining addition to Employee Collection');
	var createEmployee = Employee.Employee({
		FirstName: firstname,
		LastName: lastname,
		Email: email,
		Cell: cell,
		Department: department,
		Admin: admin,
		Scheduel: {
			Monday: scheduel[0],
			Tuesday: scheduel[1],
			Wedensday: scheduel[2],
			Thursday: scheduel[3],
			Friday: scheduel[4]
		},
		Username: username,
		Password: password
	});
	return createEmployee;
}

function dbAddToEmployee(firstname, lastname, email, cell, department, admin, scheduel, username) {
	connectABHPharmaDB();

	console.log('begining addition to Employee Collection');
	var createEmployee = Employee.Employee({
		FirstName: firstname,
		LastName: lastname,
		Email: email,
		Cell: cell,
		Department: department,
		Admin: admin,
		Scheduel: {
			Monday: scheduel[0],
			Tuesday: scheduel[1],
			Wedensday: scheduel[2],
			Thursday: scheduel[3],
			Friday: scheduel[4]
		},
		Username: username,
		Password: 'null'
	});

	createEmployee.save((err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Employee Profile Saved');

			disconnectABHPharmaDB();
		}
	});
}

function dbAddToMaterial(materialName, vendor) {
	connectABHPharmaDB();
	console.log('begining addition to Material collection');
	var createMaterial = Material.Material({
		MaterialName: materialName,
		Vendor: vendor
	});
	createMaterial.save((err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Material Profile Saved');
			disconnectABHPharmaDB();
		}
	});
}

function dbAddToVendor(vendorName, material, repName, email, number, wareHouseAddress, website, notes) {
	connectABHPharmaDB();
	console.log('begining addition to Vendor collection');
	var createVendor = Vendor.Vendor({
		VendorName: vendorName,
		Material: material,
		RepName: repName,
		Email: email,
		Number: number,
		WareHouse: wareHouseAddress,
		Website: website,
		Notes: notes
	});
	createVendor.save((err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Vendor Profile Saved');
			disconnectABHPharmaDB();
		}
	});
}

//hash password

function passwordENCRYPT(pass, username) {
	var passwordENCRYPT = bcrypt.genSalt(10, (err, salt) =>
		bcrypt.hash(pass, salt, (err, hash) => {
			if (err) throw err;
			//set password to hash
			connectABHPharmaDB();
			var query = { Username: username };
			var update = { Password: hash };

			employee.findOneAndUpdate(query, update, (err, doc) => {
				if (err) throw err;
				console.log(doc.Password);
				disconnectABHPharmaDB();
			});

			// employee.find({Username : username},function(err,data){
			//     if(err) throw err;
			//     var info = (docManipEnable({data}));
			//     info.Password = hash; // info.(whatever the key is in mongoDB)
			//     console.log(hash);
			//     console.log(info.Password)

			//     disconnectABHPharmaDB();
			// });
		})
	);
}

//////////////////////////////////////////////////////////////////////////////////////////////TESTING GROUNDS//////////////////////////////////////////////////////////////////////////////////////////////////
// var firstname = "test";
// var lastname = "test";
// var email = 'test@test.com';
// var cell = 1231231232;
// var department = 'test';
// var admin = false;
//  var scheduel = ['9 to 5','9 to 5','9 to 5','9 to 5','9 to 5',]
// var username = 'Hibrahi00';
// var password = '$2a$10$yI.peBzRZrXbVdSIVkBH0Oz6nAmBVeuJkQcKKZyFBm9qbzpQTwMRS';
// var mat = require('./models/Material').Material;
// // connectABHPharmaDB();
// var tempMaterials = ['TestMaterial']
// var matArray = [];
// var materialPop = [];
// var vendNam = 'TestVendor';

//  dbAddToEmployee('john','smith','test@test.com',1231231234,'debug',false,scheduel,username,password);

// let vendors = ["VendorXYZ"];
// let vend = 'VendorXYZ';
// let index =vendors.indexOf(vend)
// console.log(index);

// var hashKey = '';
// bcrypt.genSalt(10, (err, salt) =>
// bcrypt.hash('TigerPass)&11', salt, (err,hash) =>{
//     if(err) throw err;
//     hashKey = hash;
//     console.log(hashKey);

// })
// );

// const string = 'ajkljsdal9,09a lsdks,';
// let index = string.indexOf(',');
// console.log(index)
// if(string.charAt(index +1) === ' ' || string.charAt(index+1).match(/[a-z]/i)){
//     console.log('we found a space')
//     let newTempString =string.substring(index, string.length -1);

// }
// mat.findOne({MaterialName : 'Alpha-GPC-50%'}).then(material =>{
//     console.log(material.Vendors[0] === undefined)

// });

// let util = ['a'];
// let ind = util.indexOf("a");
// console.log(ind);
// let alpha =util.splice(ind,1)
// console.log(util);

// connectABHPharmaDB()
// material.findOne({MaterialName: 'Test-Material'}).then(matDoc =>{
//     console.log(matDoc.Vendors[0] === undefined);
//     console.log(matDoc.Vendors)
//     if(matDoc.Vendors[0] === undefined){
//         console.log('hello')
//     }})

//     let vendorList = [];

//     material.findOneAndUpdate({MaterialName : 'Test-Material'},{Vendors: vendorList}).then(matDoc =>{
//         console.log('Update Materials')

//             console.log(matDoc);
//             console.log(matDoc.Vendors[0] === undefined);
//             material.findOne({MaterialName : vendMaterial[i]}).then( material =>{
//                 // console.log(material.Vendors);

//             if(matDoc.Vendors[0] === undefined){
//                 mat.findOneAndDelete({MaterialName : material}).then('unsibscription caused this material to no be avalible anymore').catch();
//             }
//         })
//     })

// mat.findOneAndDelete({MaterialName : material}).then('unsibscription caused this material to no be avalible anymore').catch();
////////////////////////////////////////////////////////////////////////////////////////////Dev Notes Section//////////////////////////////////////////////////////////////////////////////////////////////////

///NOTE***DATE March 1st 2019****** WHEN using the ASYNCRONOUS method employee.find you have to make sure that the function that needs to be done is done within the find method otherwise things will get messy so RECOMENDATION: make functions outside the find method and pull it in since we can use the variabls from the database in there.

// require('dotenv').config();

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.sendgridAPI);
// const msg = {
// 	to: 'test@example.com',
// 	from: 'test@example.com',
// 	subject: 'Sending with SendGrid is Fun',
// 	text: 'and easy to do anywhere, even with Node.js',
// 	html: '<strong>and easy to do anywhere, even with Node.js</strong>'
// };
// sgMail.send(msg);

// console.log(process.env.sendgridAPI);
// console.log(process.env.sendgridAPI);


// console.log('this is add: '+ add);
// console.log('this is pop: ' + pop);

// material.findOne({MaterialName : 'AlphaAlphaAlpha'}).then( matDoc =>{
//     let vendorArr = matDoc.Vendors;
//     index = vendorArr.indexOf('Testing 2');
//     console.log(vendorArr);
//     vendorArr.splice(index,1);
//     console.log(vendorArr);
// })
// material.findOne({MaterialName : 'Alpha'}).then( matDoc =>{
//     console.log(matDoc.Vendors);
//     console.log(matDoc.Vendors[0]);
//     console.log(matDoc.Vendors[0] === undefined);
//     if(matDoc.Vendors[0] === undefined){
//         console.log('deltion');
//     }
// });

// connectABHPharmaDB();

// var createMat = new material({
// 	Category: 'TestCategory000111',
// 	Material: [
// 		{

// 		MaterialName : 'Material1',
// 		Vendors : [
// 			'Testor',
// 			'Alpha',
// 			'Dummy '

// 			]
		
		
// 		},

// 		{
		
		
// 		MaterialName: 'Material 2',
// 		Vendors : [
// 				'Vendor',
// 				'Beta',
// 				'New  Vendor'
// 			]
		
		
// 		}



// ]
	
// });
// createMat.save(err =>{
// 	if(err){console.log(err)}
// 	else{console.log("Material Created")}
// });

// material.find({}).then(matDoc =>{
// 	let category = new Array;
// 	let categoryName = new Array;
// 	let materialInCat = new Array;
// 	for(let i =0; i < matDoc.length; i++){
// 		category.push(matDoc[i])
// 	}
	
// 	for(let i =0; i< collection.length; i++){
// 		categoryName.push(collection[i].Category);
// 		materialInCat.push(collection[i].Material);
// 	}

	// console.log(categoryName);
	// console.log(collection[0].Material[1]);
	// console.log(materialInCat);
	// console.log(collection[1].Material[0].Vendors[0]);
	
// }).catch();

