'use strict'

const pubrouter = require('express').Router();
const mongoose = require('mongoose');
const crypto         = require('crypto');
const Pub = mongoose.model('Pub');
const auth = require('../auth');
const authCrtl = require('./../../controllers/authentication');
// CORS MIDDLEWARE
pubrouter.use((req,res,next)=>{
    // Origin of access control / CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Credentials');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
  });
// GET ALL PUBS
pubrouter.get('/', auth.optional,(req, res) => {
    Pub.find({},{'salt':0, 'hash':0},(err, pubs) =>{
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        } 
        res.status(200).json({status: "success", pubs});
    });
});
// GET PUB BY ID
pubrouter.get('/:pub_id', auth.required ,(req, res, next) => {
    Pub.findById(req.params.pub_id, {'salt':0, 'hash':0}, (err, pub) =>{
        if (err){
            res.status(500).send({status: "error", message: err});
            return;
        }
        if(!pub){
            res.status(200).json({status: "error", message: "Pub não encontrado!" })
        }else{
            res.status(200).json({status: "success", pub});
        }   
    });
});
// GET / SEARCH [ PUBS ] BY BEER NAME
pubrouter.get('/search/:beer_name', auth.optional,(req, res) => {
    
    Pub.find({'beers.name': { $regex : new RegExp(req.params.beer_name, "i") }}, {'salt':0, 'hash':0}, (err, pubs)=>{
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        }
        res.status(200).json({ status: "success", result: pubs });
    });
});
// REGISTER PUB
pubrouter.post('/register', (req, res) => {
    
    Pub.find({'email': req.body.email}, (err, pub)=>{
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        }  
        if(pub.length > 0){
            res.status(200).json({status: "error", message: "Esse e-mail já foi cadastrado."});
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
                    res.status(500).send({status: "error", message: err});
                    return;
                }else{
                    res.status(200).json({status: "success", message: "Pub criado com sucesso!", pubid: pub._id });
                }
            });  
        }
    });
});
// LOGIN
pubrouter.post('/login', (req, res) => {
    Pub.findOne({'email': req.body.email}, (err, pub)=>{
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        }
        if (pub.length == 0){
            res.status(200).json({status: "error", message: "Nenhum pub encontrado com este e-mail."});
        }else{
            
            if(pub.salt){
                let hash = crypto.pbkdf2Sync(req.body.password, pub.salt, 1000, 64, 'sha512').toString('hex');
                let verify = (hash === pub.hash);    
                let token = (verify ? pub.generateJwt(pub) : null);
                res.status(200).json({
                    status: verify ? "success" : "error", 
                    pub: verify ? pub : null,
                    valid: verify, 
                    token: token,
                    message: (verify ? "Login efetuado com sucesso!" : "Senha errada, tente novamente.")
                });
            }else{
                res.status(200).json({status: "error", message: "Verificar e Atualizar Cadastro."});
            }
        }           
    });
});
// 
pubrouter.post('/loginAuth', auth.optional, authCrtl.login_pub);
// UPDATE/ALTER PUB BY PUB_ID
pubrouter.put('/:pub_id', auth.required,(req, res) => {
    Pub.findById(req.params.pub_id, (err, pub) =>{
        if (err) {
            res.status(500).send({status: "error", message: err});
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
                    res.status(500).send({status: "error", message: err});
                    return;
                }
                res.status(200).json({status: "success", message: 'Pub modificado com sucesso!' });
            });
        }else{
            res.status(200).json({status: "error", message: "Nenhum pub encontrado."});
        }    
   });
});
// DELETE/REMOVE PUB BY PUB_ID
pubrouter.delete('/:pub_id', auth.required,(req, res) => {
    Pub.remove({_id: req.params.pub_id}, (err, pub) => {
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        }
        if(pub.n > 0){
            res.status(200).json({status: "success", message: 'Pub deletado com sucesso!' });
        }else{
            res.status(200).json({status: "error", message: 'Pub não encontrado!' });
        }
        
    });
});
// ADD/INSERT BEER(S) BY PUB_ID
pubrouter.put('/beers/:pub_id', auth.required,(req, res) => {
    Pub.update({ _id: req.params.pub_id }, 
                { $push: {  beers: req.body.beers } },
                (err, pub) => {
                    if (err) {
                        res.status(500).send({status: "error", message: err});
                        return;
                    }
                    res.status(200).json({status:"success", message: `Cerveja(s) adicionada(s) com sucesso!` });
                });
});

module.exports = pubrouter;