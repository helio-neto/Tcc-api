'use strict'

const jwt = require('express-jwt');
const config = require('config');

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;
  // console.log("GET TOKEN PARAMS",req.params);
  // console.log("GET TOKEN BODY",req.headers.authorization);
  // console.log("GET authorization",authorization);
  // let pubdel = (req.body._id) ? req.body._id : req.body.pubs[0]._id;
  // console.log("GET pubdel",pubdel);
  if(authorization && authorization.split(' ')[0] === 'Token') {
    let token = (authorization.split(' ')[1] != '') ? authorization.split(' ')[1] : authorization.split(' ')[2];
    console.log("CHEGOU AQUI", token)
    return token;
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