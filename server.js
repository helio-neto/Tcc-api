'use strict'
const express        = require('express');
const fileUpload     = require('express-fileupload');
const config         = require('config');
//const MongoClient    = require('mongodb').MongoClient;
const mongoose       = require('mongoose');
const db             = mongoose.connection;
const bodyParser     = require('body-parser');
const passport       = require('passport');
const app            = express();

const indexroute = require('./routes/index');
const pubroutes = require('./routes/pub');
const consumerroutes = require('./routes/consumer');
const port = process.env.PORT || 8080;
// 
require('./models/pub');
require('./models/consumer');
require('./config/passport');
// 
mongoose.connect(config.get('MongoDBAtlas.dbConfig.connection'));
db.on('error', console.error);
db.once('open', function() {
	console.log("Conectou ao MongoDB!");
});
// 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(fileUpload());
// ROUTES
app.use('/', indexroute);
app.use('/api/pubs', pubroutes);
app.use('/api/consumer',consumerroutes);
// 
app.listen(port, () => {
  console.log('We are live on ' + port);
});