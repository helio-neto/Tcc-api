'use strict'

const router = require('express').Router();
const Pub = require('../models/pub');
const crypto         = require('crypto');
const pubRoutes = require('./pub/index')

// BASIC ROUTES
router.get('/', (req, res) => {
    res.status(200).json({ message: "Hello Beer Lovers!!!" });   
});
// router.get('/api', (req, res) => {
//     res.status(200).json({ message: "HasBeer Api!!How may i help you?" });   
// });

module.exports = router;