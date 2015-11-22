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
	passportConfig = require('./config/passport.js'),
  server  = require('http').createServer(app),
  Twit = require('twit')

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
server.listen(port, function(){
	console.log("Server started on port", port)
})

//Twitter socket
var io = require('socket.io')(server)

//replace for security reasons
var twitter = new Twit({
  consumer_key: 
  consumer_secret:
  access_token:
  access_token_secret:
});

console.log(twitter)
var stream = twitter.stream('statuses/filter', {locations:[-180,-90,180,90]})

// {locations:[-74,40,-73,41]}

io.on('connect', function(socket) {
  stream.on('tweet', function (tweet) {
		if (tweet.coordinates){
			    var data = {}
			      data.name = tweet.user.name
			      data.screen_name = tweet.user.screen_name
			      data.text = tweet.text
			      data.user_profile_image = tweet.user.profile_image_url
						data.location = {"lat": tweet.coordinates.coordinates[0],"lng": tweet.coordinates.coordinates[1]}
						socket.emit('tweets', data)
				}
	})
})
