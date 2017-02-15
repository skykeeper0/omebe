const User = require('./../model/userModel')
const bcrypt = require('bcryptjs')

const userController = {

    createUser(req, res, next) {
        if (req.body.username.length > 0 && req.body.password.length > 0) {
            const username = req.body.username;
            const password = req.body.password;
            const cookieVal = req.body.username;
            User
                .create({
                    username: username,
                    password: password,
                    cookie: cookieVal,
                }).then( (user) => {
                    //res.cookie('session', user.cookie, {'maxAge': 3000000 }) // httpOnly later
                    //res.send('success');
                    // res.end();
                    req.encryptedCookie = user.cookie
                }).catch( (err) => {
                    console.log('This is an err: ' + err)
                    res.status(500).end();
                })
        } 
        else {
            console.log('bad')
            res.status(500).end();
        }
        next()
    },

    verifyUser(req, res, next) {
        User
            .findOne({
                where: {username: req.body.username}
            })
            .then( (user) => {
                if (!user) {
                    console.log('cant find user')
                    res.end();
                } else if (!bcrypt.compareSync(req.body.password, user.password)) {
                    console.log('wrong password');
                    res.end();
                } else {
                    const cookieVal = req.body.username;
                    console.log( ' updating ' + 'user is ' + user.username + '   old cookie is ' + user.cookie)
                    user.update({
                        cookie: req.body.username
                    }).then( () => {
                        req.encryptedCookie = user.cookie;
                        // res.cookie('session', user.cookie, {'maxAge': 3000000})
                        // console.log('sucessfully updated, new cookie is ' + user.cookie)
                        // res.send('success');

                    }).catch( (err) => {
                        console.log(user.cookie)
                        console.log('uncessfullly updated: ' + err)
                        res.end();
                    })
                }
            })
        next()
    },

    checkCookie(req, res, next) {
    if(req.cookies.session) {
        User
            .findOne({
                where: {cookie: req.cookies.session}
            })
            .then( (user) => {
                if (!user) {
                    console.log('user data', user)
                    
                    console.log('user data name', user.username)
                    req.verifiedUser = req.user.username
                } else {
                    console.log('you don\'t get shit');
                }
            })
    }
        next();
    } 

}

module.exports = userController;