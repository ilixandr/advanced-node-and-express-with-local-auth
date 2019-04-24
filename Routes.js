'use strict';

const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, db) {
  if (process.env.ENABLE_DELAYS) app.use((req, res, next) => {
    switch (req.method) {
      case 'GET':
        switch (req.url) {
          case '/logout': return setTimeout(() => next(), 500);
          case '/profile': return setTimeout(() => next(), 700);
          default: next();
        }
        break;
      case 'POST':
        switch (req.url) {
          case '/login': return setTimeout(() => next(), 900);
          default: next();
        }
        break;
      default: next();
    }
  });
  app.route('/')
    .get((req, res) => {
      //res.sendFile(process.cwd() + '/views/index.html');
      res.render(process.cwd() + '/views/pug/index.pug', {title: 'Home page', message: 'Please login', showLogin: true, showRegistration: true});
    });
  app.route('/login')
    .post(passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
      res.redirect('/profile');
    });
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };
  app.route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + '/views/pug/profile.pug', {username: req.user.username});
    });
  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });
  app.route('/register')
    .post((req, res, next) => {
      db.collection('users').findOne({ username: req.body.username }, function (err, user) {
        if(err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          let hash = bcrypt.hashSync(req.body.password, 12);
          db.collection('users').insertOne(
            {username: req.body.username,
            password: hash},
            (err, doc) => {
              if(err) {
                res.redirect('/');
              } else {
                next(null, user);
              }
            }
          )
        }
      })
    },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    });
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Page was Not Found');
  }); 
}