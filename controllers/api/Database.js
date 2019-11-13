//npm Packages to use
let mongoose = require('mongoose');
//import key to connect
let key = require('../config/keys');

//Models to manipulate
const materialCollection = require('../models/Material').Material;
const vendorCollection = require('../models/Vendor').Vendor;
const receiptCollection = require('../models/QuoteRecipts').QuoteReceipt;
const employeeCollection = require('../models/Employee').Employee;
const flaggedEventsCollection = require('../models/FlaggedEvents').FlaggedEvents;



//connect to db
connectABHPharmaDB = () => {
	mongoose
		.connect(key.ABHPHARMA_DB_CONNECT_URI, { useNewUrlParser: true })
		.then(() => console.log('Connected to ABH Pharma DB.....'))
		.catch((err) => console.log(err));
 };

 //Disconnect from db
 disconnectABHPharmaDB = () => {
    mongoose
		.disconnect(key.ABHPHARMA_DB_CONNECT_URI)
		.then(() => console.log('Disconnected From ABH Pharma DB.....'))
		.catch((err) => console.log(err));
};

//query




async function vendSearchOne(query)  {

    let doc = await vendorCollection.findOne(query).then(vDoc => {
        return  vDoc;
    });
    return doc;
};



let doc = vendSearchOne({});

console.log(doc);

//masQuery
vendCollectionPull = () => {
    vendorCollection.find({}).then(vDoc => {
        return vDoc;
    }).catch(() => console.log('something wrong with api'));
}






//export functions
module.exports = {
    connectABHPharmaDB          : connectABHPharmaDB,
    disconnectABHPharmaDB       : disconnectABHPharmaDB,
    vendSearchOne               : vendSearchOne,
    vendCollectionPull          : vendCollectionPull,
    materialCollection          : materialCollection,
    vendorCollection            : vendorCollection,
    receiptCollection           : receiptCollection,
    employeeCollection          : employeeCollection,
    flaggedEventsCollection     : flaggedEventsCollection,

}






