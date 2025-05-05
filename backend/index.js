import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from "cors";
import connectDB from './db/index.js';
import dotenv from 'dotenv';

import Message from './models/message.model.js';

dotenv.config({
  path: './.env'
})


const app = express();




app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  socket.on('join_room', async(room) => {
    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);
    

    //Load Previous message from DB

    const messages = await Message.find({ room });
    socket.emit('load_messages', messages);
 
     });
  

     //save and send message 
  socket.on("send_message", async(data) => {
   
    const newMessage=new Message({
      username:data.username,
      text:data.text,
      room:data.room
    })


    //save the message

    await newMessage.save();
   
    console.log(`Message from ${data.username} to room ${data.room}: ${data.text}`);
    
    // Send only to users in the same room
    io.to(data.room).emit("receive_message", {
      username: data.username,
      text: data.text,
      time:newMessage.time
    });
  });
  
  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
  });
});



connectDB()
.then(()=>{
  server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });

})
.catch((err)=>{
  console.log("MonGo db connection failed !!! ",err)
})