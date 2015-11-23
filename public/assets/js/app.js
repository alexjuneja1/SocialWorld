$(function () {

  var options = { zoom: 3.0, position: [47.19537,8.524404] }
  var earth = new WE.map('earth_div', {
    sky: true,
    atmosphere : true
  })
  var markers = []
  var rotation

  // Add OpenStreetMap tiles to globe
  WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '© OpenStreetMap contributors'
  }).addTo(earth);

  // Start a rotation animation
	rotation = setInterval(function() {

		var c = earth.getPosition();

		if(c[0] && c[1]){
			earth.setCenter([c[0], c[1] + 0.1]);
		}

	}, 30);

  console.log('globe initialized')

  var socket = io()

    socket.on('connect', function() {
      console.log('Connected!');
    });

    socket.on('tweets', function(tweet) {
      var html = '<div class="row"><div class="col-md-6 col-md-offset-3 tweet"><img src="' + tweet.user_profile_image + '" class="avatar pull-left"/><div class="names"><span class="full-name">' + tweet.name + ' </span><span class="username">@' +tweet.screen_name + '</span></div><div class="contents"><span class="text">' + tweet.text + '</span></div><span class="coordinates"> Location:' + tweet.location.lat + ', ' + tweet.location.lng + '</span></div></div>';
      $('#tweet-container').append(html);

      markers.push(WE.marker([tweet.location.lat, tweet.location.lng]).addTo(earth).bindPopup("This user has tweeted from <b>" + tweet.location.lat + ', ' + tweet.location.lng + '</b>', {maxWidth: 150,maxHeight:100, closeButton: true}));
    });

});
