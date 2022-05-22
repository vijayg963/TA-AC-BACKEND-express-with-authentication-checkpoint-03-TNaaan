const User = require('../models/users');
module.exports = {
  // verify that the user is logged in or not if  the user is logged
  //in then only user will be allowed to move forward anotherwise the
  // will be redirect to the log in page where the user can log in
  isUserLoggedIn: (req, res, next) => {
    // if the user is logging with  the social account then
    if (req.user._id) {
      return next();
    }
    if (req.session.userId) {
      return next();
    } else {
      res.redirect('/users/login');
    }
  },

  //Grab all the user information about  the user that is currently
  //in and add that information in the response and the request object
  userInformation: async (req, res, next) => {
    try {
      if (req.user) {
        let user = req.user;
        res.locals.user = user;
        return next();
      }
      if (!req.user) {
        let userId = req.session.userId.toString();
        let user = await User.findById(userId, 'name email');
        req.user = user;
        res.locals.user = user;
        return next();
      }
    } catch (err) {
      req.user = false;
      res.locals.user = false;
      next();
    }
  },
  // in this if the user is verifed then only  the user is allowed to move
  //forward anoterwise user is redirected to verify user page where the user can verify himself
  userIsVerified: async (req, res, next) => {
    try {
      let userId = req.user._id.toString();
      let user = await User.findById(userId);
      if (user.isverified == true) {
        console.log('yes the user is verified');
        return next();
      }
      // if the user is not verified then redirect him  to
      // verification page
      else {
        return res.redirect('/users/verify');
      }
    } catch (err) {
      return res.redirect('/users/verify');
    }
  },
};
