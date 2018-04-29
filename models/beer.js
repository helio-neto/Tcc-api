'use strict'
const mongoose       = require('mongoose');
const Schema         = mongoose.Schema;

const BeerSchema      = new Schema({
    name: String,
    style: String,
    abv: String,
    ibu: String,
    obs: String
});

module.exports      = mongoose.model('Beer', BeerSchema);