'use strict'
const mongoose       = require('mongoose');
const Schema         = mongoose.Schema;
const crypto         = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('config');

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

const PubSchema      = new Schema({
    pubname: String,
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

PubSchema.methods.setPassword = (password)=>{
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
}

PubSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
}
PubSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const secret = config.get("Auth.key.value");
  
    return jwt.sign({
      _id: this._id,
      email: this.email,
      name: this.pubname,
      exp: parseInt(expiry.getTime() / 1000),
    }, secret); 
  };

  PubSchema.methods.toAuthJSON = function() {
    return {
      _id: this._id,
      email: this.email,
      token: this.generateJwt(),
    };
  };

module.exports      = mongoose.model('Pub', PubSchema);