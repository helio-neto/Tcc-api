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
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Credentials');
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
    
    Pub.find({'beers.name': { $regex : new RegExp(req.params.beer_name, "i") }}, 
                            {'salt':0, 'hash':0}, (err, pubs)=>{
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
pubrouter.post('/registerAuth', auth.optional, authCrtl.register_pub);
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
            console.log("BODY",req.body)
            pub.pubname = (req.body.pubname) ? req.body.pubname : pub.pubname;  
            pub.location.street = (req.body.location.street) ? req.body.location.street : pub.location.street;
            pub.location.lat = (req.body.location.lat) ? req.body.location.lat : pub.location.lat;
            pub.location.lng = (req.body.location.lng) ? req.body.location.lng : pub.location.lng;
            pub.location.city = (req.body.location.city) ? req.body.location.city : pub.location.city;
            pub.location.uf = (req.body.location.uf) ? req.body.location.uf : pub.location.uf;
            pub.location.hood = (req.body.location.hood) ? req.body.location.hood : pub.location.hood;
            pub.ownername = (req.body.ownername) ? req.body.ownername : pub.ownername;
            pub.phone = (req.body.phone) ? req.body.phone : pub.phone;
            pub.email = (req.body.email) ? req.body.email : pub.email;
            pub.celphone = (req.body.celphone) ? req.body.celphone : pub.celphone;
            pub.info = (req.body.info) ? req.body.info : pub.info;
            pub.photo = (req.body.photo) ? req.body.photo : req.body.photo;
            pub.beers = (req.body.beers) ? req.body.beers : pub.beers;
            console.log("PUB",pub);
            // save the pub and check for errors
            pub.save((err, updatedPub)=> {
                if (err) {
                    res.status(500).send({status: "error", message: err});
                    return;
                }
                res.status(200).json({status: "success", message: 'Pub modificado com sucesso!', pub: updatedPub });
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
    Pub.findOneAndUpdate({ _id: req.params.pub_id }, 
                { $addToSet: {  beers: req.body.beers } },
                { new: true, runValidators: true},
                (err, pub) => {
                    if (err) {
                        res.status(500).send({status: "error", message: err});
                        return;
                    }
                    if(pub){
                        // console.log("PUB_",pub.beers);
                    }
                }
    ).then((newBeer)=>{
        // console.log("newBeer",newBeer.beers);
        res.status(200).json({status:"success", message: `Cerveja(s) adicionada(s) com sucesso!`, beers: newBeer.beers });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
// EDIT BEER
pubrouter.patch('/beers/:pub_id', auth.required,(req, res) => {
    console.log("REQ",req.body.beer._id);
    Pub.findOneAndUpdate({ _id: req.params.pub_id, "beers._id": req.body.beer._id }, 
                { $set: {  "beers.$": req.body.beer } },
                { new: true, runValidators: true},
                (err, beers) => {
                    if (err) {
                        res.status(500).send({status: "error", message: err});
                        return;
                    }
                    if(beers){
                        // console.log("PUB_",pub.beers);
                    }
                }
    ).then((newBeer)=>{
        // console.log("newBeer",newBeer.beers);
        res.status(200).json({status:"success", message: `Cerveja alterada com sucesso!`, beers: newBeer.beers });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
// DELETE BEER(S) FROM BEER MENY BY PUB_ID && BEER_ID
pubrouter.delete('/beers/:pub_id', auth.required,(req, res) => {
    Pub.update({ _id: req.params.pub_id }, 
        { $pull: { beers:{ _id : req.body.beer_id} } },
        {new: true, multi: true},
        (err, beers) => {
            if (err) {
                res.status(500).send({status: "error", message: err});
                return;
            }
            if(beers){
                console.log("beers delete", beers);
            }
        }
    ).then((newBeers)=>{
        console.log("newBeers pull",newBeers);
        res.status(200).json({status:"success", message: `Cerveja(s) removida(s) com sucesso!`, beers: newBeers });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
// ADD COMMENT TO PUB BY PUB_ID
pubrouter.put('/comments/:pub_id', auth.required,(req, res) => {
    Pub.findOneAndUpdate({ _id: req.params.pub_id},
        { $addToSet: { comments: req.body.comment} },
        { new: true, runValidators: true},
        (err, pub) => {
            if (err) {
                res.status(500).send({status: "error", message: err});
                return;
            }
            if(pub){
                console.log("PUB_",pub);
            }
        }
    ).then((newcomment)=>{
        console.log("newcomment",newcomment);
        res.status(200).json({status:"success", message: `Comentário(s) adicionado(s) com sucesso!`, pub: newcomment });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
// DELETE COMENT(S) FROM FAVORITES BY PUB_ID && COMMENT_ID
pubrouter.delete('/comments/:pub_id', auth.required,(req, res) => {
    Pub.update({ _id: req.params.pub_id }, 
        { $pull: { comments:{ _id : req.body.comment_id} } },
        {new: true, multi: true},
        (err, comment) => {
            if (err) {
                res.status(500).send({status: "error", message: err});
                return;
            }
            if(comment){
                console.log("comment", comment);
            }
        }
    ).then((newComment)=>{
        console.log("newComment pull",newComment);
        res.status(200).json({status:"success", message: `Comentário(s) removido(s) com sucesso!`, pub: newComment });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});

module.exports = pubrouter;