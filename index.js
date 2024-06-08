
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

//import required modules
require("dotenv").config(); //ensures that all the variables from '.env' are avaiable
const mongoose = require("mongoose");

const mongoURI = process.env.DATABASE;
require("./model/message");
const Message = mongoose.model("Message");
//this is for Auth0 attempt

const { auth, requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'H3U8gvAlhSEhYQRZDIXV3tu1IsHQgOiKwrKbothX19Yd2P5bOIyloo2OR_B1kZ5_',
  baseURL: 'https://termproject314.onrender.com',
  clientID: 'NmvvDKW0LaPZwXGF3vnjGSvWUeE5AKHt',
  issuerBaseURL: 'https://dev-yvldmmdm6yil6dfe.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL
app.use(auth(config));



//code trying to remake the original code, but trying to let the rest of the code actually work
app.get('/login', (req, res, next) => { 
  if (!req.oidc.isAuthenticated()) {
    res.send('auth failed');
    return; 
  }
  next(); // Proceed to the next middleware/route handler
});
/* Original code
// req.oidc.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(
    req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out'
  )
});
*/

/*
// The /profile route will show the user profile as JSON
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});
*/
/*
app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
*/




//EVERYTHING BELOW HERE IS BASELINE
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