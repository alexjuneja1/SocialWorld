var
	express = require('express'),
	app = express(),
	ejs = require('ejs'),
	ejsLayouts = require('express-ejs-layouts'),
	mongoose = require('mongoose'),
	flash = require('connect-flash'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	passport = require('passport'),
	passportConfig = require('./config/passport.js')

// environment port
var port = process.env.PORT || 8000

//user routes
var userRoutes = require('./routes/user_routes.js')

// connect to database
mongoose.connect('mongodb://localhost/socialworld', function(err){
	if(err) return console.log('Database connection error')
	console.log('Connected to MongoDB. You are in the matrix!')
})

// middleware
app.use(logger('dev'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// middleware - session tracking
app.use(session({
	secret: 'lincolnlogs',
	cookie: {_expires: 6000000}
}))

// middleware - passport
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// view configuration
app.set('view engine', 'ejs')
app.use(ejsLayouts)

// routes
app.get('/', function(req,res){
	res.render('index')
})

app.use('/', userRoutes)

// open server port
app.listen(port, function(){
	console.log("Server running on port", port)
})
