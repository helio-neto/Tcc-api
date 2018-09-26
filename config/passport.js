'use strict'

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Pub = mongoose.model('Pub');
const Consumer = mongoose.model('Consumer');
const crypto         = require('crypto');

passport.use('pub_local',new LocalStrategy({usernameField: 'email'}, (email, password, done)=> {
  console.log("Autenticando pub");
  Pub.findOne({ email: email },  (err, pub)=> {
    if (err) { return done(err); }
    // Return if user not found in database
    if (!pub) {
      return done(null, false, {
        message: 'Pub não encontrado com este e-mail.'
      });
    }
    let hash = crypto.pbkdf2Sync(password, pub.salt, 1000, 64, 'sha512').toString('hex');
    let verify = (hash === pub.hash);
    // Return if password was wrong
    if(!verify){
      return done(null, false, {
        message: 'Senha errada.Por favor, tente novamente'
      });
    }
    // If credentials are correct, return the user object
    pub.salt = "";
    pub.hash = "";      
    return done(null, pub);
  });
}
));

passport.use('consumer_local',new LocalStrategy({usernameField: 'email'}, (email, password, done)=> {
  console.log("Autenticando usuário");
  Consumer.findOne({ email: email },  (err, consumer)=> {
    if (err) { return done(err); }
    // Return if user not found in database
    if (!consumer) {
      return done(null, false, {
        message: 'Usuário não encontrado com este e-mail.'
      });
    }
    let hash = crypto.pbkdf2Sync(password, consumer.salt, 1000, 64, 'sha512').toString('hex');
    let verify = (hash === consumer.hash);
    // Return if password was wrong
    if(!verify){
      return done(null, false, {
        message: 'Senha errada.Por favor, tente novamente'
      });
    }
    // If credentials are correct, return the user object
    consumer.salt = "";
    consumer.hash = "";      
    return done(null, consumer);
  });
}
));
