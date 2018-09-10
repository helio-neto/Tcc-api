const passport = require('passport');
const mongoose = require('mongoose');
const Pub = mongoose.model('Pub');

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

  let pub = new Pub();

  pub.pubname = req.body.pubname;
  pub.email = req.body.email;

  pub.setPassword(req.body.password);

  pub.save(function(err) {
    let token;
    token = pub.generateJwt();
    res.status(200);
    res.json({
      "token" : token
    });
  });

};

module.exports.login = (req, res) =>{

  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "status": "error",
      "message": "All fields required"
    });
    return;
  }

  passport.authenticate('local', (err, pub, info) =>{
    let token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json({
        "status": "error",
        "message": err
      });
      return;
    }

    // If a user is found
    if(pub){
      token = pub.generateJwt();
      res.status(200);
      res.json({
        "status": "success",
        "token" : token
      });
    } else {
      // If user is not found
      res.status(500).json({
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