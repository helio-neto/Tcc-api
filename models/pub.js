'use strict'
const mongoose       = require('mongoose');
const Schema         = mongoose.Schema;

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
    beers: [beer]
});

module.exports      = mongoose.model('Pub', PubSchema);