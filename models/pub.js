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
    let pub = {
        salt: crypto.randomBytes(16).toString('hex'),
        hash: crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex')
    }
    return pub;
}

PubSchema.methods.validPassword = (password)=> {
    
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
}

PubSchema.methods.generateJwt = (pub)=> {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const secret = config.get("Auth.key.value");
    
    return jwt.sign({
        _id: pub._id,
        email: pub.email,
        name: pub.pubname,
        exp: parseInt(expiry.getTime() / 1000),
    }, secret); 
};

PubSchema.methods.validateToken = (token)=>{
    return jwt.verify(token, config.get("Auth.key.value"), (err,decoded)=>{
        if (err) 
            return res.status(500).send({ auth: false, status: "error", 
                                            message: 'Token Inválido.' });
        res.status(200).send(decoded);
    })
};

PubSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        email: this.email,
        token: this.generateJwt(),
    };
};

module.exports      = mongoose.model('Pub', PubSchema);