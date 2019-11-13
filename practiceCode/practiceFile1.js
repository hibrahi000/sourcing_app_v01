let db = require('../controllers/api/Database');
let key = require('../controllers/config/keys');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// let token = jwt.sign(
// 	{
// 		material: 'Hello World',
// 		vendorName: 'testingVendor',
// 		test: 'test'
		
// 	},
// 	key.jwtSecret,
// 	{
// 		expiresIn: '3m'
// 	}
// );
let orderType ='asdas';
var token = jwt.sign(
	{
	vendorName : 'asd',
	shipCompName : 'asd',
	shipAddress1 : 'asd',
	shipAddress2 : 'asd',
	shipCity : 'asd',
	shipState : 'asd',
	shipZip : 'asd',
	shipCountry : 'asd',
	newMaterial : 'asd',
	rushOrder: 'asd',
	targetPrice: 'asd',
	material: 'asd',
	category:'asd',
	orderType: 'asd',
	abhRequest: `sad + ${orderType}`,


	},
	key.jwtSecret,
	{
	expiresIn: "1m",
	algorithm:  "RS256"
	}
);
// console.log(token);
// let vendorKeys = [...vend.key, token];
// console.log(token);

let decode = jwt.decode(token,)

console.log(token);

setTimeout(() => {
	jwt.verify(token, key.jwtSecret,((err) =>{
		if(err){
			console.log('there is a error');
		}
		else{
			console.log("clear");
		}
	}));
}, 1000*60*2);

let array1 =[1,2,3,4,5];
let array2 = [...array1,6]
console.log(array2);

// db.connectABHPharmaDB();
// db.vendorCollection.find({}).then(doc => {
// 	doc.map(d => { d.key = []});
// 	console.log(doc[0])

	// doc.forEach(element => {
	// 	db.vendorCollection.findByIdAndUpdate(element._id,{key:element.key}).then(console.log(`updated ${element.VendorName}'s key to ${element.key}`));
	// });
// })
