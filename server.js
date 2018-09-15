'use strict'
const express        = require('express');
const config         = require('config');
//const MongoClient    = require('mongodb').MongoClient;
const mongoose       = require('mongoose');
const db             = mongoose.connection;
const bodyParser     = require('body-parser');
const passport       = require('passport');
const app            = express();
const router = express.Router();
const indexroute = require('./routes/index');
const pubroutes = require('./routes/pub');
const port = process.env.PORT || 8080;

require('./models/pub');
require('./config/passport');

mongoose.connect(config.get('MongoDBAtlas.dbConfig.connection'));
db.on('error', console.error);
db.once('open', function() {
	console.log("Conectou ao MongoDB!");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/', indexroute);
app.use('/api/pubs', pubroutes);

// CORS MIDDLEWARE
router.use((req,res,next)=>{
  // Origin of access control / CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});
app.listen(port, () => {
  console.log('We are live on ' + port);
});