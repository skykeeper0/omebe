const obj = require('./../model/models');
const User = obj.User;


// const User = require('./../model/userModel')
const bcrypt = require('bcryptjs');

const userController = {

  createUser(req, res, next) {
    console.log('IN createUser');
    if (req.body.username.length > 0 && req.body.password.length > 0) {
      const username = req.body.username;
      const password = req.body.password;
      const cookieVal = req.body.username;
      User
        .create({
          username: username,
          password: password,
          cookie: cookieVal,
        }).then((user) => {
        //res.cookie('session', user.cookie, {'maxAge': 3000000 }) // httpOnly later
        //res.send('success');
        // res.end();
        console.log('the user cookie is ', user.cookie);
        req.encryptedCookie = user.cookie;
        req.newUser = user.username;
        next();
      }).catch((err) => {
        //need to store error
        console.log('This is an err: ' + err);
        res.send({success: false, status: "User already exists"});
      })
    } else {
      console.log('bad');
      res.status(500).end();
    }
  },

  verifyUser(req, res, next) {
    console.log('IN verifyUser');
    User
      .findOne({
        where: { username: req.body.username },
      })
      .then((user) => {
        if (!user) {
          console.log('cant find user');
          res.send({success: false, status: "Invalid Entry"});
        } else if (!bcrypt.compareSync(req.body.password, user.password)) {
          console.log('wrong password');
          res.send({success: false, status: "Wrong Password"});
        } else {
          const cookieVal = req.body.username;
          console.log( ' updating ' + 'user is ' + user.username + '   old cookie is ' + user.cookie);
          user.update({
            cookie: req.body.username,
          }).then(() => {
            req.encryptedCookie = user.cookie;
            //res.cookie('session', user.cookie, {'maxAge': 3000000})
            // console.log('sucessfully updated, new cookie is ' + user.cookie)
            // res.send('success');
            next();
          }).catch((err) => {
            console.log('unsucessfullly updated: ' + err);
            res.send({success: false, status: "No Such User"});
          });
        }
      });
  },

  checkCookie(req, res, next) {
    console.log('IN checkCookie');
    if (req.cookies.session) {
      User
        .findOne({
          where: { cookie: req.cookies.session },
        })
        .then((user) => {
          if (!user) {
            console.log('we didnt find your cookie');
            next();
          } else {
            req.user_id = user.user_id;
            req.verifiedUser = user.username;
            console.log('found your cookie');
            next();
          }
        }).catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
    } else {
      // no cookies!
      next();
    }
  },
  logOut (req, res, next) {
    console.log('in logout');
    next()
  }
};

module.exports = userController;