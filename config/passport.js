'use strict'

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Pub = mongoose.model('Pub');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
    Pub.findOne({ email: email }, function (err, pub) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!pub) {
        return done(null, false, {
          message: 'Pub não encontrado com este e-mail.'
        });
      }
      // Return if password is wrong
      if (!pub.validPassword(password)) {
        return done(null, false, {
          message: 'Senha errada.Por favor, tente novamente'
        });
      }
      // If credentials are correct, return the user object
      return done(null, pub);
    });
  }
));

