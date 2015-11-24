$(function () {
    var globe = null

  //GOOGLE WEBGL-GLOBE
    if(!Detector.webgl){
      Detector.addGetWebGLMessage();
    } else {

      // Where to put the globe?
      var container = document.getElementById( 'globe-container' );

      // Make the globe
      globe = new DAT.Globe( container );
      console.log('Google webGl-globe initialized: ' + globe);

      // // We're going to ask a file for the JSON data.
      // var xhr = new XMLHttpRequest();
      //
      // // Where do we get the data?
      // xhr.open( 'GET', 'assets/js/tweets.json', true );
      //
      // // What do we do when we have it?
      // xhr.onreadystatechange = function() {
      //
      //     // If we've received the data
      //     console.log('xhr response: ', xhr)
      //     if ( xhr.readyState === 4 && xhr.status === 200 ) {
      //
      //         // Parse the JSON
      //         var data = JSON.parse( xhr.responseText );
      //
      //         // Tell the globe about your JSON data
      //         console.log('json data: ', data)
      //         for ( var i = 0; i < data.length; i ++ ) {
      //             globe.addData( data[i][1], {format: 'magnitude', name: data[i][0]} );
      //         }
      //
      //         // Create the geometry
      //         globe.createPoints();
      //
      //         // Begin animation
      //         globe.animate();
      //
      //     }
      };
      //
      // // Begin request
      // xhr.send( null );

  var socket = io();

  socket.on('connect', function() {
    console.log('Connected!');
  });

  socket.on('tweets', function(tweet) {
    var html = '<div class="row"><div class="col-md-6 col-md-offset-3 tweet"><img src="' + tweet.user_profile_image + '" class="avatar pull-left"/><div class="names"><span class="full-name">' + tweet.name + ' </span><span class="username">@' +tweet.screen_name + '</span></div><div class="contents"><span class="text">' + tweet.text + '</span></div></div></div>';
    $('#tweet-container').prepend(html);

    //GOOGLE GLOBE MARKERS
    // globe.addData( data[i][1], {format: 'magnitude', name: data[i][0]} )
    // globe.addData([tweet.location.lat, tweet.location.lng, 0.02, 0x00FF66], { format: 'magnitude', name: 'twitter'})
    // globe.createPoints()
    // globe.animate()
  });

  $('form').submit(function(e){
    e.preventDefault();
    var search_term = $('input').val();
    socket.emit('updateTerm', search_term);
    console.log('emitting search')
  });

  socket.on('updatedTerm', function(searchTerm) {
    $('h1').text("Twitter Search for "+ searchTerm);
    console.log(searchTerm);
  });

});
