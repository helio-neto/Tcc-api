const passport = require('passport');
const mongoose = require('mongoose');
const Pub = mongoose.model('Pub');
const config = require('config');
const jwt = require('jsonwebtoken');

const sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = (req, res) =>{
  
  if(!req.body.name || !req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  
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
  pub.save((err,pub) => {
    if (err) { 
      return res.status(500).json({status: "error", message: err});
    }else{
      let expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      const secret = config.get("Auth.key.value");
      let token =  jwt.sign({
        _id: pub._id,
        email: pub.email,
        name: pub.pubname,
        exp: parseInt(expiry.getTime() / 1000),
      }, secret);
      return res.status(200).json({status: "success", message: "Pub criado com sucesso!", pubid: pub._id, token: token });
    }
  }); 
  // pub.save(function(err) {
  //   let token;
  //   token = pub.generateJwt();
  //   res.status(200);
  //   res.json({
  //     "token" : token
  //   });
  // });
  
};

module.exports.login = (req, res) =>{
  const { body: { pub } } = req;
  
  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "status": "error",
      "message": "All fields required"
    });
    return;
  }
  
  passport.authenticate('local', (err, pub, info) =>{
    // If Passport throws/catches an error
    if (err) {
      return res.status(404).json({
        "status": "error",
        "message": err
      });
    }
    // If a user is found
    if(pub){
      var expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      const secret = config.get("Auth.key.value");
      
      let token =  jwt.sign({
        _id: pub._id,
        email: pub.email,
        name: pub.pubname,
        exp: parseInt(expiry.getTime() / 1000),
      }, secret);
    
      return res.status(200).json({
        "status": "success",
        "message": "Login efetuado com sucesso!",
        "pub": pub,
        "token" : token
      });
    } else {
      // If user is not found
      return res.status(200).json({
        "status": "error",
        "message": info.message
      });
    }
  })(req, res);
  // {
  
  //     const { body: { pub } } = req;
  
  //     if(!pub.email) {
  //         return res.status(422).json({
  //           errors: {
  //             email: 'is required',
  //           },
  //         });
  //       }
  
  //       if(!pub.password) {
  //         return res.status(422).json({
  //           errors: {
  //             password: 'is required',
  //           },
  //         });
  //       }
  //       return passport.authenticate('local', { session: false }, (err, passportPub, info) => {
  //         if(err) {
  //           return next(err);
  //         }
  
  //         if(passportPub) {
  
  //           let pubret = new Pub(passportPub);
  //           pubret.token = pubret.generateJwt();
  
  //           return res.json({ pub: pubret.toAuthJSON() });
  //         }
  
  //         return status(400).info;
  //       })(req, res, next);
  // });
  
};
