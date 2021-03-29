const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require('../models/User')

//Login Page
router.get('/login', (req, res) => res.render('login'));

//Register Page
router.get('/register', (req, res) => res.render('register'));

//Register Handle
router.post('/register', (req, res) => {
    const {name, email, password, password2 } = req.body;
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let errors = [];

    // Check required Fields
    if(!name || !email || !password || !password2 ){
        errors.push({ msg: 'Please fill in all fields' });
    }

    //check passwords match
    if(password !== password2){
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check pass Length
    if(password < 6){
        errors.push({ msg: 'Passwords should be at least 6 characters' });
    }

    if(errors.length > 0){
        console.log(1);
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        console.log(2);
        // Validation Passed
        User.findOne({ 'email': email})
        .then(user => {
            console.log(`This is the user: ${user} ***`)
            if(user) {
                console.log(3);
                // User Exists
                errors.push({ msg: 'Email is already registered' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
                // const newUser = new User({
                //     name,
                //     email,
                //     password
                // });

                // console.log(newUser)
                // res.send('hello');
            }  else {
                console.log(4);
                const newUser = new User({
                    name,
                    email,
                    password,
                    date: today
                });
                
                // Hase Password
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        //Set password to hashed
                        newUser.password = hash;
                        //Save User
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login')
                        })
                        .catch(err => console.log(err));
                    }))
            }
        });
    }

});

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;
