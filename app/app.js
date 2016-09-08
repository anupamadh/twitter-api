var morgan = require('morgan');
var express = require('express');
var app = express();
var port = process.env.PORT || 4000;
var router = express.Router();
var server = require('http').createServer(app);

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));


router.get('/', function(req, res) {
  res.render('index', {
    header: 'Twitter Stream Yow'
  });
});

router.get('/contact', function(req, res) {
  res.render('contact', {
    header: 'contact!'
  });
});

router.get('/about', function(req, res) {
  res.render('about', {
    header: 'about!'
  });
});

app.use('/', router);
server.listen(port);

console.log('Server started on ' + port);

// integrate twitter api through "twit" module
var Twit = require('twit');

// create twitter object, pass in all the api arguments

// 1. consumer key
// 2. consumer key secret
// 3. access token
// 4. access token secret
var twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// integrate socket io
var io = require('socket.io')(server);

// listening and talking to the client
var stream;
var search_tweet;
io.on('connect', function(socket) {

  console.log('io started and can talk and listen');
  stream = twitter.stream('statuses/filter', {
    track: search_tweet
  });

  socket.on('search_send', function(data) {
    if (stream) {
      stream.stop();
    }
    console.log("received data " + data);
    stream = twitter.stream('statuses/filter', {
      track: data
    });
    console.log('this is the start of the twitter stream');
    stream.on('tweet', function(tweet) {
      console.log('new tweet object, pass it to client')


      // important things that you can get from a twitter stream in this application
      //user.name
      //user.screen_name
      //text
      //user.profile_image_url
      var new_tweet = {
        name: tweet.user.name,
        screen_name: tweet.user.screen_name,
        text: tweet.text,
        user_profile_image: tweet.user.profile_image_url
      }

      socket.emit('new_pablo', new_tweet);
    });
  });

  // stream.on('tweet', function(tweet) {
  //   console.log('new tweet object, pass it to client')


    // important things that you can get from a twitter stream in this application
    //user.name
    //user.screen_name
    //text
    //user.profile_image_url
    // var new_tweet = {
    //   name: tweet.user.name,
    //   screen_name: tweet.user.screen_name,
    //   text: tweet.text,
    //   user_profile_image: tweet.user.profile_image_url
    // }
    //
    // socket.emit('new_pablo', new_tweet);
  //
  // });
});
