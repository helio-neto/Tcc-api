'use strict'

const jwt = require('express-jwt');
const config = require('config');

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;
  
  if(authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  if(req.body.token){
    return req.body.token;
  }
  return null;
};

const auth = {
  required: jwt({
    secret: config.get("Auth.key.value"),
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: config.get("Auth.key.value"),
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

module.exports = auth;