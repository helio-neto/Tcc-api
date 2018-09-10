'use strict'
const mongoose       = require('mongoose');
const Schema         = mongoose.Schema;
//const crypto         = require('crypto');
//const jwt = require('jsonwebtoken');

let beer = new Schema({
    name: String,
    style: String,
    abv: String,
    ibu: String,
    obs: String,
    price: {
        half_pint: Number,
        pint: Number,
        mass: Number
    }
});  

const Consumerchema      = new Schema({
    consumername: String,
    location: {
		street: String,
		lat: Number,
		lng: Number,
        city: String,
        uf: String,
        hood: String
	},
    ownername: String,
    phone: String,
    celphone: String,
    info: String,
    email: String,
    photo: String,
    created: { type: Date, default: Date.now },
    beers: [beer],
    hash: String,
    salt: String,
});

// PubSchema.methods.setPassword = (password)=>{
//     this.salt = crypto.randomBytes(16).toString('hex');
//     this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
// }

// PubSchema.methods.validPassword = function(password) {
//     var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
//     return this.hash === hash;
// }

module.exports      = mongoose.model('Consumer', Consumerchema);