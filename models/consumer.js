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

let pub = new Schema({
    _id: Schema.Types.ObjectId,
    pub_name: String
})

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
    phone: String,
    celphone: String,
    info: String,
    email: String,
    photo: String,
    created: { type: Date, default: Date.now },
    favorites: {
        beers: [beer],
        pubs: [pub]
    },
    hash: String,
    salt: String,
});

module.exports      = mongoose.model('Consumer', Consumerchema);