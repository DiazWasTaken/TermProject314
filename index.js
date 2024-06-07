const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);


const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;



//import required modules
require("dotenv").config(); //ensures that all the variables from '.env' are avaiable
const mongoose = require("mongoose");

const mongoURI = process.env.DATABASE;
require("./model/message");
const Message = mongoose.model("Message");


mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connection established"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});


//Google passport stuff
passport.use(new GoogleStrategy({
    clientID: 496285652496-g3gr2choo6q32fff78eh3pk1kouub5pc.apps.googleusercontent.com,
    clientSecret: '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',
    callbackURL: 'https://termproject314.onrender.com/oauth2/callback',
    scope: ['profile', 'email']
  }, (accessToken, refreshToken, profile, done) => {
    // Find or create user in your database using profile.id or profile.email
    User.findOne({ googleId: profile.id }) // Replace User with your model name
      .then(existingUser => {
        if (existingUser) {
          return done(null, existingUser);
        }
  
        const newUser = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value
        });
  
        return newUser.save().then(user => done(null, user));
      })
      .catch(err => done(err, null));
  }));

  // Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session()); // Assuming you're using sessions

// Route for Google login (trigger Passport authentication flow)
app.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route for Google authentication (handle successful/failed login)
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful login, redirect to chat or desired route
  res.redirect('/chat');
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
    });
  });

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);

      const messageToSave = new Message({ message: msg });

      messageToSave.save();
    });
  });
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});