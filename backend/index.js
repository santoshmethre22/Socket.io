import express from "express"
import { Server}  from "socket.io"
import cors from "cors"
import http from "http"


const app=express();

app.use(cors);

// It uses WebSockets (with fallbacks) to keep a constant connection
//  open, allowing instant updates without the need for reloading or polling.

// 💡 Use cases:
// Chat applications 💬
// Real-time dashboards 📊
// Live notifications 🔔

const server=http.createServer(app);// creats server here
const io=new Server(server,{
        cors:{
            // steps for the cors 
        }

})// attack socket.io to server---->


// 4. Listen for new socket connections
// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);  // Logs the connected client's ID


io.on('connection',(socket)=>{
    console.log("the connected client of id ",socket.id);


    socket.on("message",(data)=>{
        console.log("Recived Data ",data);

        socket.emit("messageResponse",`server recived ${data}`);
    })

    socket.on('disconnect',()=>{
        console.log("User disconnected:",socket.id);
    })
})


server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });

  