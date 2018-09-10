'use strict'

const router = require('express').Router();
const Pub = require('../models/pub');
const crypto         = require('crypto');
const pubRoutes = require('./pub/index')
router.use((req,res,next)=>{
    // Origin of access control / CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
// BASIC ROUTES
router.get('/', (req, res) => {
    res.status(200).json({ message: "Hello Beer Lovers!!!" });   
});
// router.get('/api', (req, res) => {
//     res.status(200).json({ message: "HasBeer Api!!How may i help you?" });   
// });

module.exports = router;