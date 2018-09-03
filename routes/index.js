'use strict'

const router = require('express').Router();
const Pub = require('../models/pub');
const jwt = require('jsonwebtoken');
const crypto         = require('crypto');

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
    res.json({ message: "Hello Beer Lovers!!!" });   
});
router.get('/api', (req, res) => {
    res.json({ message: "HasBeer Api!!How may i help you?" });   
});
/*
*   PUB ROUTES
*/
// GET ALL PUBS
router.get('/api/pubs', (req, res) => {
    Pub.find((err, pubs) =>{
        if (err) {
            res.status(500).send({status: "error", error: err});
            return;
        } 
        res.json(pubs);
    });
});
// GET PUB BY ID
router.get('/api/pubs/:pub_id', (req, res) => {
    Pub.findById(req.params.pub_id, (err, pub) =>{
        if (err){
            res.status(500).send({status: "error", error: err});
            return;
        }
        if(!pub){
            res.json({status: "error", message: "Pub não encontrado!" })
        }else{
            res.json({status: "success", pub});
        }   
    });
});
// GET / SEARCH [ PUBS ] BY BEER NAME
router.get('/api/pubs/search/:beer_name', (req, res) => {
    
    Pub.find({'beers.name': { $regex : new RegExp(req.params.beer_name, "i") }}, (err, pubs)=>{
        if (err) {
            res.status(500).send({status: "error", error: err});
            return;
        }
        res.json({ status: "success", result: pubs });
    });
});
// CREATE/ADD/INSERT NEW PUB
router.post('/api/pubs', (req, res) => {

    let pub = new Pub();      
    pub.pubname = req.body.pubname;  
    pub.location.street = req.body.location.street;
    pub.location.lat = req.body.location.lat;
    pub.location.lng = req.body.location.lng;
    pub.location.city = req.body.location.city;
    pub.location.uf = req.body.location.uf;
    pub.location.hood = req.body.location.hood;
    pub.ownername = req.body.ownername;
    pub.phone = req.body.phone;
    pub.email = req.body.email;
    pub.celphone = req.body.celphone;
    pub.info = req.body.info;
    pub.photo = req.body.photo;
    pub.beers = req.body.beers;
    // save the pub and check for errors
    pub.save((err) => {
        if (err) {
            res.status(500).send({status: "error", error: err});
            return;
        }
        res.json({ message: 'Pub Criado!' });
    });
});
// REGISTER PUB
router.post('/api/pubs/register', (req, res) => {
    
    Pub.find({'email': req.body.email}, (err, pub)=>{
        if (err) {
            res.status(500).send({status: "error", error: err});
            return;
        }  
        if(pub.length > 0){
            res.json({status: "error", message: "Seu e-mail já foi cadastrado."});
        }else{
            let pub = new Pub();      
            pub.pubname = req.body.pubname;  
            pub.location.street = req.body.location.street;
            pub.location.lat = req.body.location.lat;
            pub.location.lng = req.body.location.lng;
            pub.location.city = req.body.location.city;
            pub.location.uf = req.body.location.uf;
            pub.location.hood = req.body.location.hood;
            pub.ownername = req.body.ownername;
            pub.phone = req.body.phone;
            pub.email = req.body.email;
            pub.celphone = req.body.celphone;
            pub.info = req.body.info;
            pub.photo = req.body.photo;
            pub.beers = req.body.beers;
            pub.salt = crypto.randomBytes(16).toString('hex');
            pub.hash = crypto.pbkdf2Sync(req.body.password, pub.salt, 1000, 64, 'sha512').toString('hex');
            //Save the pub and check for errors
            pub.save((err,pub) => {
                if (err) {
                    res.status(500).send({status: "error", error: err});
                    return;
                }else{
                    res.json({status: "success", message: "Pub criado com sucesso!", pubid: pub._id });
                }
            });  
        }
    });
});
// LOGIN
router.post('/api/pubs/login', (req, res) => {
    Pub.find({'email': req.body.email}, (err, pub)=>{
        if (err) {
            res.status(500).send({status: "error", error: err});
            return;
        }
        if (pub.length == 0){
            res.json({status: "error", message: "Nenhum pub encontrado com este e-mail."});
        }else{
            if(pub[0].salt){
                let hash = crypto.pbkdf2Sync(req.body.password, pub[0].salt, 1000, 64, 'sha512').toString('hex');
                let verify = (hash === pub[0].hash);    
                res.json({
                    status: verify ? "success" : "error", 
                    pub: verify ? pub : null,
                    valid: verify, 
                    message:verify ? "Login efetuado com sucesso!" : "Senha errada, tente novamente."
                });
            }else{
                res.json({status: "error", message: "Verificar/Atualizar Cadastro."});
            }
        }           
    });
});
// UPDATE/ALTER PUB BY PUB_ID
router.put('/api/pubs/:pub_id', (req, res) => {
    Pub.findById(req.params.pub_id, (err, pub) =>{
        if (err) {
            res.status(500).send({status: "error", error: err});
            return;
        }
        if(pub){
            pub.pubname = req.body.pubname;  
            pub.location.street = req.body.location.street;
            pub.location.lat = req.body.location.lat;
            pub.location.lng = req.body.location.lng;
            pub.location.city = req.body.location.city;
            pub.location.uf = req.body.location.uf;
            pub.location.hood = req.body.location.hood;
            pub.ownername = req.body.ownername;
            pub.phone = req.body.phone;
            pub.email = req.body.email;
            pub.celphone = req.body.celphone;
            pub.info = req.body.info;
            pub.photo = req.body.photo;
            pub.beers = req.body.beers;
            // save the pub and check for errors
            pub.save((err)=> {
                if (err) {
                    res.status(500).send({status: "error", error: err});
                    return;
                }
                res.json({status: "success", message: 'Pub modificado com sucesso!' });
            });
        }else{
            res.json({status: "error", message: "Nenhum pub encontrado."});
        }    
   });
});
// DELETE/REMOVE PUB BY PUB_ID
router.delete('/api/pubs/:pub_id', (req, res) => {
    Pub.remove({_id: req.params.pub_id}, (err, pub) => {
        if (err) {
            res.status(500).send({status: "error", error: err});
            return;
        }
        if(pub.n > 0){
            res.json({status: "success", message: 'Pub deletado com sucesso!' });
        }else{
            res.json({status: "error", message: 'Pub não encontrado!' });
        }
        
    });
});
// ADD/INSERT BEER(S) BY PUB_ID
router.put('/api/pubs/beers/:pub_id', (req, res) => {
    Pub.update({ _id: req.params.pub_id }, 
                { $push: {  beers: req.body.beers } },
                (err, pub) => {
                    if (err) {
                        res.status(500).send({status: "error", error: err});
                        return;
                    }
                    res.json({status:"success", message: 'Cerveja(s) adicionada(s) com sucesso!' });
                });
});



module.exports = router;