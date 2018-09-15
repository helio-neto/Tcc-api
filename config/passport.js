'use strict'

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Pub = mongoose.model('Pub');
const crypto         = require('crypto');
const jwt = require('jsonwebtoken');

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=> {
    
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

