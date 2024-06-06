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