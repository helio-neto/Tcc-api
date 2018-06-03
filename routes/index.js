'uses scritc'

const router = require('express').Router();
const Pub = require('../models/pub');

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
// BASIC ROUTES
router.get('/', (req, res) => {
    res.json({ message: "Hello Beer Lovers!!!" });   
});
router.get('/api', (req, res) => {
    res.json({ message: "HasBeer Api!!How may i help you?" });   
});
/*
*   PUB ROUTES
*/
// GET ALL PUBS
router.get('/api/pubs', (req, res) => {
    Pub.find((err, pubs) =>{
        if (err)
            res.send(err);
        res.json(pubs);
    });
});
// GET PUB BY ID
router.get('/api/pubs/:pub_id', (req, res) => {
    Pub.findById(req.params.pub_id, (err, pub) =>{
        if (err)
            res.send(err);
        res.json(pub);
    });
});
// CREATE/ADD/INSERT NEW PUB
router.post('/api/pubs', (req, res) => {

    let pub = new Pub();      
    pub.pubname = req.body.pubname;  
    pub.location.street = req.body.location.street;
    pub.location.lat = req.body.location.lat;
    pub.location.lng = req.body.location.lng;
    pub.location.city = req.body.location.city;
    pub.location.uf = req.body.location.uf;
    pub.location.hood = req.body.location.hood;
    pub.ownername = req.body.ownername;
    pub.phone = req.body.phone;
    pub.celphone = req.body.celphone;
    pub.info = req.body.info;
    pub.photo = req.body.photo;
    pub.beers = req.body.beers;
    // save the pub and check for errors
    pub.save((err) => {
        if (err)
            res.send(err);
        res.json({ message: 'Pub Criado!' });
    });
});
// UPDATE/ALTER PUB BY PUB_ID
router.put('/api/pubs/:pub_id', (req, res) => {
    Pub.findById(req.params.pub_id, function(err, pub) {
        if (err)
            res.send(err);

            pub.pubname = req.body.pubname;  
            pub.location.street = req.body.location.street;
            pub.location.lat = req.body.location.lat;
            pub.location.lng = req.body.location.lng;
            pub.location.city = req.body.location.city;
            pub.location.uf = req.body.location.uf;
            pub.location.hood = req.body.location.hood;
            pub.ownername = req.body.ownername;
            pub.phone = req.body.phone;
            pub.celphone = req.body.celphone;
            pub.info = req.body.info;
            pub.photo = req.body.photo;
            pub.beers = req.body.beers;
        // save the pub and check for errors
        pub.save(function(err) {
        if (err)
            res.send(err);
        res.json({ message: 'Pub Modificado!' });
        });
   });
});
// DELETE/REMOVE PUB BU PUB_ID
router.delete('/api/pubs/:pub_id', (req, res) => {
    Pub.remove({_id: req.params.pub_id}, (err, pub) => {
        if (err)
            res.send(err);
        res.json({ message: 'Pub deletado!' });
    });
});
// ADD/INSERT BEER(S) BY PUB_ID
router.put('/api/pubs/beers/:pub_id', (req, res) => {
    Pub.update({ _id: req.params.pub_id }, {
        $push: {  beers: req.body.beers   }
    },
    (err, pub) => {
        if (err)
            res.send(err);
        res.json({ message: 'Cerveja(s) adicionada(s)!' });
    });
});
// SEARCH WHO HAS THAT BEER BY BEER NAME
router.get('/api/search/:beer_name', (req, res) => {
    
    Pub.find({'beers.name': { $regex : new RegExp(req.params.beer_name, "i") }}, 'pubname location',(err, pub)=>{
        if (err)
            res.send(err);
        res.json({ result: pub });
    });
});

module.exports = router;