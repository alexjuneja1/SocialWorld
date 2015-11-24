$(function () {
    var searchForm = $('#search')
    var searchTermInput = $('#search-term')
    var globe, publishInterval, cachedTweet
    var socket = io()

    socket.on('connect', function() {
      // Clear publish interval just be sure they don't stack up (probably not necessary)
      if (publishInterval) {
        clearInterval(publishInterval);
      }
      // Only publish a Tweet every 100 millseconds so that the browser view is not overloaded
      // This will provide a predictable and consistent flow of real-time Tweets
      publishInterval = setInterval(function () {
        if (cachedTweet) {
          publishTweet(cachedTweet);
        }
      }, 100); // Adjust the interval to increase or decrease the rate at which Tweets sent to the clients
    });

    var maxTweets = 0;
    socket.on('tweets', function(tweet) {
      console.log(tweet)
      // save the Tweet so that the very latest Tweet is available and can be published
      cachedTweet = tweet
      // if (maxTweets >= 15) return;
      var html = '<div class="row"><div class="col-md-6 col-md-offset-3 tweet"><img src="' + tweet.user_profile_image + '" class="avatar pull-left"/><div class="names"><span class="full-name">' + tweet.name + ' </span><span class="username">@' +tweet.screen_name + '</span></div><div class="contents"><span class="text">' + tweet.text + '</span></div><span class="coordinates"> Location:' + tweet.location.lat + ', ' + tweet.location.lng + '</span></div></div>';
      maxTweets++;
      $('#tweet-container').prepend(html);

      //GOOGLE GLOBE MARKERS
      // globe.addData( data[i][1], {format: 'magnitude', name: data[i][0]} )
      globe.addData([tweet.location.lat, tweet.location.lng, 0.3, 0x33ff6d], { format: 'magnitude', name: 'twitter'})
      globe.createPoints()
      globe.frameRender()
      globe.animate()
    });

    searchForm.on('submit', function(evt){
      evt.preventDefault()
      console.log(searchTermInput.val())
      socket.emit('updateTerm', searchTermInput.val())
    })

  //GOOGLE WEBGL-GLOBE
    if(!Detector.webgl){
      Detector.addGetWebGLMessage();
    } else {

      // Where to put the globe?
      var container = document.getElementById( 'globe-container' );

      // Make the globe
      globe = new DAT.Globe( container );
      console.log('Google webGl-globe initialized: ' + globe);
      globe.frameRender()
      globe.animate()
  }
});
