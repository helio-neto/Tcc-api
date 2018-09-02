'use strict'
const express        = require('express');
const config         = require('config');
//const MongoClient    = require('mongodb').MongoClient;
const mongoose       = require('mongoose');
const db             = mongoose.connection;
const bodyParser     = require('body-parser');
const app            = express();
const routes = require('./routes');
const port = process.env.PORT || 8080;

mongoose.connect(config.get('MongoDBAtlas.dbConfig.connection'));
db.on('error', console.error);
db.once('open', function() {
	console.log("Conectou ao MongoDB!");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', routes);

app.listen(port, () => {
  console.log('We are live on ' + port);
});