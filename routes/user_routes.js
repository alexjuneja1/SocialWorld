var
    express = require('express'),
    passport = require('passport'),
    userRoutes = express.Router()

userRoutes.route('/login')
    .get(function(req,res){
        res.render('login', {message: req.flash('loginMessage')})
    })
    .post(passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login'
    }))

userRoutes.route('/signup')
    .get(function(req,res){
        // render create account form
        res.render('signup')
    })
    .post(passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup'
    }))

userRoutes.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}))

userRoutes.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
}))

userRoutes.get('/profile', isLoggedIn, function(req,res){
        res.render('profile', {user: req.user})
})

userRoutes.get('/logout', function(req,res){
    req.logout()
    res.redirect('/')
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) return next ()
    res.redirect('/')
}

module.exports = userRoutes
