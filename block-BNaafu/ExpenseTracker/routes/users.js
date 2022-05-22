var express = require('express');
var router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const Verifyemail = require('../models/emailverification');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// render a form to  register the user
router.get('/register', (req, res) => {
  try {
    res.render('registeruser');
  } catch (err) {
    res.redirect('/');
  }
});

//save the user data in the databse register the user
router.post('/register', async (req, res) => {
  try {
    let user = await User.create(req.body);
    return res.redirect('/');
  } catch (err) {
    res.redirect('/users/register');
  }
});

//rendre a login page  with a form to login the user

router.get('/login', (req, res) => {
  try {
    res.render('login');
  } catch (err) {
    res.redirect('/');
  }
});

// authenticate the user who is trying to login
router.post('/login', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      let passwordIsMatched = await bcrypt.compare(
        req.body.password,
        user.password
      );
      req.session.userId = user._id;
      if (passwordIsMatched && user.isverified === true) {
        res.redirect('/dashboard');
      }
      res.redirect('/users/verify');
    }
    res.redirect('/users/login');
  } catch (err) {
    res.redirect('/users/login');
  }
});

router.get('/verify', async (req, res) => {
  try {
    //deleting all the previously generated codes that are saved in the database
    let deleteAll = await Verifyemail.deleteMany({});
    let userCode = generateRandom();

    //send the mail to the user  along with  the code
    var transporter = nodemailer.createTransport(
      smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'rahulmandyal079@gmail.com',
          pass: 'Vishal@$079',
        },
      })
    );

    var mailOptions = {
      from: 'rahulmandyal079@gmail.com',
      to: 'flixpahadi@gmail.com',
      subject: 'Sending Email using Node.js[nodemailer]',
      html: `<h1> Hey copy  the code and verify to use our services<h1>
    <p>${userCode}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('got an error in sending the messages ', error);
      } else {
        console.log('Message send sucessfully ', info);
      }
    });

    //Once the message is sent to the user then we will
    // also save this code in the database so we can verify the user  when he will try to
    // verify the code that we have sent to the  user

    let userVerifyDocument = await Verifyemail.create({
      email: req.user.email,
      verificationCode: userCode,
    });
    res.render('userverify');
  } catch (err) {
    res.redirect('/dashboard');
  }
});

// Render  the verificationCode webpage to the user  so user
// can enter the verification code
router.get('/verificationcode', async (req, res) => {
  try {
    res.render('verificationcode');
  } catch (err) {
    res.redirect('/users/login');
  }
});

//getting the verfication code that the user has sent and then verifying
// the code with the code that we have saved in the database
//if the code matched then only  the user  document will be updated (isverified : true)
router.post('/verificationcode', async (req, res) => {
  try {
    const code = Number(req.body.verificationCode);
    let user = await Verifyemail.findOne({ email: req.user.email });
    if (user.verificationCode === code) {
      let verifyUser = await User.findOneAndUpdate({
        email: req.user.email,
        isverified: true,
      });
      return res.redirect('/dashboard');
    }
  } catch (err) {
    res.redirect('/users/login');
  }
});

// logout the user by destroying the cookies
router.get('/logout', (req, res) => {
  //destroy the session data
  console.log('yes request is coming on the logout ');
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

//generate the random code to send to user so we can verify that user
function generateRandom() {
  let number = 9859839;
  return Math.floor(Math.random() * number);
}
module.exports = router;
