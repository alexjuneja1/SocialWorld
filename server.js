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
  Twit = require('twit'),
	THREE = require("three-js")();

// environment port
var port = process.env.PORT || 8000

//user routes
var userRoutes = require('./routes/user_routes.js')

var db = 'mongodb://admin:admin@ds057954.mongolab.com:57954/socialworld'

// connect to database
mongoose.connect(db, function(err){
	if(err) return console.log('Database connection error')
	console.log('Connected to MongoDB. You are in the matrix!')
})

// middleware
app.use(logger('dev'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// static assets route
app.use(express.static(__dirname + '/public'))

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

app.get('/globe', function(req,res){
	res.render('globe')
})

app.use('/', userRoutes)
app.get('/login', function(req,res){
	res.render('login')
})
app.get('/signup', function(req,res){
	res.render('signup')
})

// open server port
server.listen(port, function(){
	console.log("Server started on port", port)
})

//Twitter socket
var io = require('socket.io')(server)

//replace for security reasons
var twitter = new Twit({
  consumer_key: 'NhLqnXQuYUa0JZNLnGTdJeJRi',
  consumer_secret: 'lixdhEaLQlXbTvb6Piu9YsjElDDb5EneHPlXhsS56O1rtJMUek',
  access_token: '3160155739-YZySxWlm2TYrmwMt2xrR3pFuVy5J8ud2u5r5L5Q',
  access_token_secret: 'LkpfCTfAyxUNX1PqRiHs23Ns9Ict5b9lBAFk2TB2VZ2aa'
})

console.log(twitter)
// var stream = twitter.stream('statuses/filter', {locations:[-180,-90,180,90]})
// {locations:[-74,40,-73,41]}

var stream;
var searchTerm;

io.on('connect', function(socket){
	console.log('io connected')
  socket.on('updateTerm', function(searchTerm){
		console.log('term updated', searchTerm)
    // socket.emit('updatedTerm', searchTerm);
    if(stream){
      console.log('stopped stream');
      stream.stop();
		}
			 stream = twitter.stream('statuses/filter'
			 , {track: searchTerm
				 	, language: 'en'
				})
				//  , {locations:[-180,-90,180,90]})
		  stream.on('tweet', function (tweet) {
				// console.log(Object.keys(tweet.coordinates));
				if (tweet.place){
					console.log(tweet.place.bounding_box.coordinates[0][0])
					    var data = {}
					      data.name = tweet.user.name
					      data.screen_name = tweet.user.screen_name
					      data.text = tweet.text
					      data.user_profile_image = tweet.user.profile_image_url
								data.location = {"lat": tweet.place.bounding_box.coordinates[0][0][1],"lng": tweet.place.bounding_box.coordinates[0][0][0]}
								data.full_name = tweet.place.full_name
								console.log(data)
								socket.emit('tweets', data)
				} else if (tweet.coordinates && tweet.coordinates.coordinates){
					console.log(tweet.coordinates.coordinates)
							var data = {}
								data.name = tweet.user.name
								data.screen_name = tweet.user.screen_name
								data.text = tweet.text
								data.user_profile_image = tweet.user.profile_image_url
				        data.location = {"lat": tweet.coordinates.coordinates[0], "lng": tweet.coordinates.coordinates[1]}
								console.log(data)
				        socket.emit('tweets', data);  //sending info back to the client
						}
			})
	})
})
