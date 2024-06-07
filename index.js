//import the firebase library
import { initializeApp} from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
//unclear whether or not this is needed
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';


//sets up the firebase app with my settings or whatever
const firebaseConfig = {
  apiKey: "AIzaSyBY3yRdndtqVTMhuEbqSSQqmMzVAifcC8I",
  authDomain: "cs314termproject.firebaseapp.com",
  projectId: "cs314termproject",
  storageBucket: "cs314termproject.appspot.com",
  messagingSenderId: "418036102427",
  appId: "1:418036102427:web:6701f93073d9f1e11b0fbe",
  measurementId: "G-8P72BTSRRC"
};
const firebaseApp = initializeApp(firebaseConfig);

//uses unclear firebase store 
const db = getFirestore(firebaseApp);

//even more unclear
// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, 'cities');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
};



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
//assuming this is where i can place all of the stuff that isnt const or setting up
// this is for firebase setup


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