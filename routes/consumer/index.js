'use strict'

const consumerrouter = require('express').Router();
const mongoose = require('mongoose');
const crypto         = require('crypto');
const Consumer = mongoose.model('Consumer');
const auth = require('../auth');
const authCrtl = require('./../../controllers/authentication');
// CORS MIDDLEWARE
consumerrouter.use((req,res,next)=>{
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
// 
consumerrouter.get('/', auth.required,(req, res) => {
    res.status(200).json({ message: "Hello Beer Drinker And Lovers!!!" }); 
});
// ADMIN ROUTE TO VIEW CONSUMERS LIST
consumerrouter.get('/admin/consumers', auth.required,(req,res)=>{
    Consumer.find({},(err, consumers) =>{
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        } 
        res.status(200).json({status: "success", consumers});
    });
})
// GET USER BY ID
consumerrouter.get('/:consumer_id', auth.required ,(req, res, next) => {
    Consumer.findById(req.params.consumer_id, {'salt':0, 'hash':0}, (err, consumer) =>{
        if (err){
            res.status(500).send({status: "error", message: err});
            return;
        }
        if(!consumer){
            res.status(200).json({status: "error", message: "Usuário não encontrado!" })
        }else{
            res.status(200).json({status: "success", consumer});
        }   
    });
});
// 
consumerrouter.post('/upload', (req, res)=> {
    if (!req.files)
    return res.status(400).send({status: "error", message: 'No files were uploaded.'});
    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.photo;
    
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('/assets/imgs/consumers/filename.jpg', function(err) {
        if (err)
        return res.status(500).send(err);
        res.status(200).json({status: "success", message:'File uploaded!'});
        // res.send('File uploaded!');
    });
});
// REGISTER CONSUMER
consumerrouter.post('/registerAuth',auth.optional, authCrtl.register_consumer);
// LOGIN CONSUMER
consumerrouter.post('/loginAuth', auth.optional, authCrtl.login_consumer);
// UPDATE/ALTER CONSUMER BY CONSUMER_ID
consumerrouter.put('/:consumer_id', auth.required,(req, res) => {
    Consumer.findById(req.params.consumer_id, (err, consumer) =>{
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        }
        if(consumer){
            consumer.consumername = (req.body.consumername) ? req.body.consumername : consumer.consumername;  
            consumer.location.street = (req.body.location.street) ? req.body.location.street : consumer.location.street;
            consumer.location.lat = (req.body.location.lat) ? req.body.location.lat : consumer.location.lat;
            consumer.location.lng = (req.body.location.lng) ? req.body.location.lng : consumer.location.lng;
            consumer.location.city = (req.body.location.city) ? req.body.location.city : consumer.location.city;
            consumer.location.uf = (req.body.location.uf) ? req.body.location.uf : consumer.location.uf;
            consumer.location.hood = (req.body.location.hood) ? req.body.location.hood : consumer.location.hood;
            consumer.phone = (req.body.phone) ? req.body.phone : consumer.phone;
            consumer.email = (req.body.email) ? req.body.email : consumer.email;
            consumer.celphone = (req.body.celphone) ? req.body.celphone : consumer.celphone;
            consumer.info = (req.body.info) ? req.body.info : consumer.info;
            consumer.photo = (req.body.photo) ? req.body.photo : consumer.photo;
            // save the consumer and check for errors
            consumer.save((err, updatedConsumer)=> {
                if (err) {
                    res.status(500).send({status: "error", message: err});
                    return;
                }
                res.status(200).json({status: "success", message: 'Usuário modificado com sucesso!', consumer: updatedConsumer });
            });
        }else{
            res.status(200).json({status: "error", message: "Nenhum usuário encontrado."});
        }    
    });
});
// DELETE/REMOVE USER BY USER_ID
consumerrouter.delete('/:consumer_id', auth.required,(req, res) => {
    Consumer.remove({_id: req.params.consumer_id}, (err, consumer) => {
        if (err) {
            res.status(500).send({status: "error", message: err});
            return;
        }
        if(consumer.n > 0){
            res.status(200).json({status: "success", message: 'Consumidor deletado com sucesso!' });
        }else{
            res.status(200).json({status: "error", message: 'Consumidor não encontrado!' });
        }
        
    });
});
// ADD/INSERT PUBS(S) TO FAVORITES BY USER_ID
consumerrouter.put('/favorites/pubs/:consumer_id', auth.required,(req, res) => {
    Consumer.findOneAndUpdate({ _id: req.params.consumer_id},
        { $addToSet: { "favorites.pubs": req.body.pubs} },
        { new: true, runValidators: true},
        (err, consumer) => {
            if (err) {
                res.status(500).send({status: "error", message: err});
                return;
            }
        }
    ).then((newConsumer)=>{
        console.log("newconsumer",newConsumer.favorites.pubs);
        res.status(200).json({status:"success", message: `Estabelecimento(s) adicionada(s) com sucesso!`, consumer: newConsumer });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
// DELETE PUBS(S) FROM FAVORITES BY USER_ID
consumerrouter.delete('/favorites/pubs/:consumer_id', auth.required,(req, res) => {
    Consumer.update({ _id: req.params.consumer_id}, 
        { $pull: { "favorites.pubs" : { _id: req.body.pub_id} } },
        (err, consumer) => {
            console.log("consumer", consumer);
            if (err) {
                res.status(500).send({status: "error", message: err});
                return;
            }
        }, {new: true, multi: true}
    ).then((newConsumer)=>{
        console.log("consumer pull",newConsumer);
        res.status(200).json({status:"success", message: `Estabelecimento(s) removido(s) com sucesso!`, consumer: newConsumer });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
// ADD/INSERT BEERS(S) TO FAVORITES BY USER_ID
consumerrouter.put('/favorites/beers/:consumer_id', auth.required,(req, res) => {
    Consumer.findOneAndUpdate({ _id: req.params.consumer_id}, 
        { $addToSet: { "favorites.beers": req.body.beers} },
        { new: true, runValidators: true },
        (err, consumer) => {
            if (err) {
                res.status(500).send({status: "error", message: err});
                return;
            }
        }
    ).then((newConsumer)=>{
        res.status(200).json({status:"success", message: `Cerveja(s) adicionada(s) com sucesso!`, consumer: newConsumer });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
// ADD/INSERT PUBS(S) TO FAVORITES BY USER_ID
consumerrouter.delete('/favorites/beers/:consumer_id', auth.required,(req, res) => {
    Consumer.update({ _id: req.params.consumer_id}, 
        { $pull: { "favorites.beers" : { _id: req.body.beer_id} } },
        (err, consumer) => {
            console.log("consumer", consumer);
            if (err) {
                res.status(500).send({status: "error", message: err});
                return;
            }
        }, {new: true, multi: true}
    ).then((newConsumer)=>{
        console.log("consumer pull",newConsumer);
        res.status(200).json({status:"success", message: `Cerveja(s) removida(s) com sucesso!`, consumer: newConsumer });
    }).catch((error)=>{
        res.status(500).send({status: "error", message: error});
    });
});
    
module.exports = consumerrouter;