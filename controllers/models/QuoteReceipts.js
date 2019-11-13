// <!-- Response from vendor:

// Material: Whey Protein Concentrate
// ABH Requested: Rush Order Of 50 Pounds: One Time

// Item Code: FF434#OO
// Min Order Quantity: 550 kg
// Price: 400 USD ---- Delivered Price
// In Stock : Yes
// Date In Stock:



// Payment Type: advancePay
// Payment Terms: n/a
// Shipping Date


// Shipping Company Name:2Bros Shipping LLC
// Shipping Company Address 1: 123 test ave
// Shipping Company Address 2:
// Shipping Company City: Queens
// Shipping Company State: New York
// Shipping Company Zip-Code: 11580
// Notes left by :
// . -->


const mongoose = require('mongoose');

const QuoteReceipt = mongoose.model(

    'QuoteReceipt',

    new mongoose.Schema({
    VendorName: {
        type: String,
        required: true
    },
    Category: [{
        CategoryName: {type: String, required: true},
        Material: [{
            MaterialName : {type: String, required: true},
            Receipt : [{
                Category : {
                    type: String,
                    default: null
                },
                Material:{
                    type : String,
                    default : null
                },
                ABH_Request: {
                    type : String,
                    default: null
                },
                Item_Code: {
                    type:String,
                    default : null
                },
                Amount: {
                    type : String,
                    default : null
                },
                Price: {
                    type : Number,
                    default: null
                },
                Price_Type: {
                    type : String,
                    default : null
                },
                In_Stock:{
                    type: String,
                    default : null
                },
                Date_In_Stock:{
                    type: String,
                    default : null
                },
                PayType : {
                    type: String,
                    default: null
                },
                PayTerms: {
                    type: String,
                    default: null
                },
                ShippingDate : {
                    type: String,
                    default: null
                },
                Shipping_Company_Name :{
                    type: String,
                    default : null
                },
                Ship_Address1 :{
                    type: String,
                    default : null
                },
                Ship_Address2 :{
                    type: String,
                    default : null
                },
                Ship_City :{
                    type: String,
                    default : null
                },
                Ship_State :{
                    type: String,
                    default : null
                },
                Ship_Zip :{
                    type: Number,
                    default : null
                },
                Ship_Country:{
                    type: String,
                    default : null
                },
                Notes: {
                    type: String,
                    default: null
                },
                DateCreated :{
                    type: String,
                    default : Date
                }
            }]
        }]
    }]
}), 'QuoteReceipt');

module.exports = {QuoteReceipt};