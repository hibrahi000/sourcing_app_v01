var express = require('express');
var expressLayouts = require('express-ejs-layouts')
var app = express();
var controller = require('./controllers/controller');
const flash = require('connect-flash');
const sessions = require('cookie-session');
const pass = require('./controllers/config/passport');
const PORT = process.env.PORT || 500
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
var favicon = require('serve-favicon');
require('dotenv').config();
const key = process.env;
const passport = require('passport');
let transporter = sgMail;

const mailOptionsReq = {
	from: 'CorporationA Purchase Dept. <hashmatibrahimi0711@gmail.com>', // sender address
	to:	'Hashmatibrahimi0711@gmail.com', // list of receivers
	cc: "",
	//${vendorContact[i]},
	subject: `CorporationA Quote Request for Demo Material `, // Subject line
	text: `hello world`
}

let apiKey = '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';

sgMail.setApiKey(key.sendgridAPI);



//Sessions
app.use(sessions({
    maxAge: 1000   *   60   * 60   *  2,
         //miliSec    sec     min    hours     days
    keys: [key.cookieKey]
}));




//passport config
require('./controllers/config/passport')(passport);
//  passport middleware
app.use(passport.initialize('./controllers/config/passport.js')); // this initializes
app.use(passport.session());

//___/setup template engine
app.set('view engine', 'ejs');





//connect flash
app.use(flash());

// app.use(favicon(__dirname + '/favicon.ico'));


//global vars
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})




//static files
app.use(express.static(__dirname + "/assets"));


//fire controlers
controller(app);




//listen to port /
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


