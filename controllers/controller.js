////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       CONFIG/REQ/FUNCTIONS
//

/////////////////////////////////////////RREQUIRE SECTION////////////////////////////////////
const welcomeRoute             = require('./routes/welcomeRoute');
const purchasingRoute          = require('./routes/purchasingRoutes');
const adminRoute               = require('./routes/AdminRoutes');
const vendorRoute              = require('./routes/vendorRoutes');
const jwt                      = require('jsonwebtoken');
const bodyParser               = require('body-parser');
const mongoose                 = require('mongoose');
const bcrypt                   = require('bcryptjs');
const passport                 = require('passport');
const LocalStrategy            = require('passport-local').Strategy;
const adminEnsureAuthenticated = require('./config/auth').adminEnsureAuthenticated;
const purchEnsureAuthenticated = require('./config/auth').purchEnsureAuthenticated;
const employee                 = require('./models/Employee').Employee;
const mat                      = require('./models/Material').Material;
const vendor                   = require('./models/Vendor').Vendor;
const receipt                  = require('./models/QuoteReceipts').QuoteReceipt;
const urlencodedParser         = bodyParser.urlencoded({ extended: false });
const sgMail                   = require('@sendgrid/mail');
const key = process.env;
// * ////////////////////////////VARIABLE SECTION////////////////////////////////////////
let   errors                   = [];
let   admin                    = 'dashboard';
let   purchase                 = 'dashboard';
let   clicked                  = false;

//@param key.sendgridAPI  this is my parameter
let transporter = sgMail;

// console.log(key.sendgridAPI);

// * //////////////////////////////////Functions////////////////////////////////////////////////////////

//Encrypt Pass -- DEBUG : TRUE
function passwordENCRYPT(pass, username) {
	bcrypt.genSalt(10, (err, salt) =>
		bcrypt.hash(pass, salt, (err, hash) => {
			if (err) throw err;
			//set password to hash
			connectABHPharmaDB();
			var query = { Username: username };
			var update = { Password: hash };
		})
	);
}

//connect to db --DEBUG : TRUE
function connectABHPharmaDB() {
	mongoose
		.connect(key.mongo_connect_uri, { useNewUrlParser: true })
		.then(() => console.log('Connected to ABH Pharma DB.....'))
		.catch((err) => console.log(err));
}

let disconnectABHPharmaDB = () => {
	mongoose
		.disconnect(key.ABHPHARMA_DB_CONNECT_URI)
		.then(() => console.log('Disconnected From ABH Pharma DB.....'))
		.catch((err) => console.log(err));
};



// !This is where we export stuff to the apps


module.exports = (app) => {
	//launch routes
	let imports = {bcrypt,app,key,passport,errors,admin,purchase,clicked,LocalStrategy,jwt,purchEnsureAuthenticated,adminEnsureAuthenticated,bodyParser,employee,mat,vendor,receipt,urlencodedParser,transporter,connectABHPharmaDB,disconnectABHPharmaDB};



	welcomeRoute(imports);
	purchasingRoute(imports);
	vendorRoute(imports);
	adminRoute(imports);

}

