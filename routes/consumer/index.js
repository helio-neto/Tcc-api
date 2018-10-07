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
// 
consumerrouter.get('/admin/consumers', auth.required,(req,res)=>{
    Consumer.find({},{'salt':0, 'hash':0},(err, consumers) =>{
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
            consumer.name = req.body.name;  
            consumer.location.street = req.body.location.street;
            consumer.location.lat = req.body.location.lat;
            consumer.location.lng = req.body.location.lng;
            consumer.location.city = req.body.location.city;
            consumer.location.uf = req.body.location.uf;
            consumer.location.hood = req.body.location.hood;
            consumer.phone = req.body.phone;
            pub.email = req.body.email;
            consumer.celphone = req.body.celphone;
            consumer.info = req.body.info;
            consumer.photo = req.body.photo;
            consumer.beers = req.body.beers;
            // save the pub and check for errors
            consumer.save((err)=> {
                if (err) {
                    res.status(500).send({status: "error", message: err});
                    return;
                }
                res.status(200).json({status: "success", message: 'Usuário modificado com sucesso!' });
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
// ADD/INSERT BEER(S) BY USER_ID
consumerrouter.put('/beers/:consumer_id', auth.required,(req, res) => {
    Consumer.update({ _id: req.params.consumer_id }, 
                { $push: {  beers: req.body.beers } },
                (err, consumer) => {
                    if (err) {
                        res.status(500).send({status: "error", message: err});
                        return;
                    }
                    res.status(200).json({status:"success", message: `Cerveja(s) adicionada(s) com sucesso!` });
                });
});

module.exports = consumerrouter;