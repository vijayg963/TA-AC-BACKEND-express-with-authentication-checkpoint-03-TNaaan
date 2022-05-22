var express = require('express');
var router = express.Router();
const Users = require('../models/users');
const passport = require('passport');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/failure', (req, res) => {
  res.send('  authetication is failed');
});

router.get('/sucess', (req, res) => {
  return res.redirect('/');
});

//  these two routes are to login using  the google account
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/sucess',
    failureRedirect: '/failure',
  })
);

// these two account are to login usin  the github account
router.get('/auth/github', passport.authenticate('github'));
// callback resposible for the response from the server of the user

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/failure' }),
  (req, res) => {
    res.redirect('/sucess');
  }
);
module.exports = router;
