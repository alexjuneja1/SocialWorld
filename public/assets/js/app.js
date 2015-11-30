$(function () {
    var searchForm = $('#search')
    var searchTermInput = $('#search-term')
    var globe, publishInterval, cachedTweet
    var socket = io()

    socket.on('connect', function() {
      console.log('socket stream connected!')
    });

    var counter = 0
    socket.on('tweets', function(tweet) {
      // add Tweet to Tweet-container
      var tweetmoji = twemoji.parse(tweet.text)
      var html = '<div class="row"><div class="col-md-11 col-md-offset-1 tweet"><img src="' + tweet.user_profile_image + '" class="avatar pull-left"/><div class="names"><span class="full-name">' + tweet.name + ' </span><span class="username">@' + tweet.screen_name + '</span></div><div class="contents"><span class="text">' + tweetmoji + '</span></div><span class="coordinates"> Location: ' + tweet.full_name + '</span></div></div><br> ';
      counter ++;
      $('#tweet-container').prepend(html);
      if (counter > 6) {
      $('#tweet-container .tweet').last().remove()
      }

      // add Tweet Marker to Globe
      TwtrGlobe.onTweet(tweet)

      //GOOGLE GLOBE MARKERS
      // globe.addData( data[i][1], {format: 'magnitude', name: data[i][0]} )
      // globe.addData([tweet.location.lat, tweet.location.lng, 0.5, 0x33ff6d], { format: 'magnitude', name: 'twitter'})
      // globe.createPoints()
      // globe.frameRender()
      // globe.animate()
    });

    searchForm.on('submit', function(evt){
      evt.preventDefault()
      console.log(searchTermInput.val())
      socket.emit('updateTerm', searchTermInput.val())
    })

  //GOOGLE WEBGL-GLOBE
    // if(!Detector.webgl){
    //   Detector.addGetWebGLMessage();
    // } else {
    //
    //   // Where to put the globe?
    //   var container = document.getElementById( 'globe-container' );
    //
    //   // Make the globe
    //   globe = new DAT.Globe( container );
    //   console.log('Google webGl-globe initialized: ' + globe);
    //   globe.createPoints()
    //   globe.animate()
  // }
});
