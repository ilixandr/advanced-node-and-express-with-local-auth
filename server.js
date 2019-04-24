'use strict';
const routes = require('./Routes.js');
const auth = require('./Auth.js');
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');

const app = express();

app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const passport = require('passport');
const session = require('express-session');
app.use(session({secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

const mongodb = require('mongodb');
const mongo = mongodb.MongoClient;
mongo.connect(process.env.DATABASE, {useNewUrlParser: true}, (err, client) => {
    let db = client.db('test');
    if(err) {
        console.log('Database error: ' + err);
    } else {
        console.log('Successful database connection');
        auth(app, db);
        routes(app, db);
    }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

