import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(""); // New state for room
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    if (room) {
      socket.emit("join_room", room); // Emit when room changes
    }


    socket.on("receive_message", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    return () => socket.off("receive_message");
  }, [room]);

  const sendMessage = (e) => {
       e.preventDefault();
    if (message.trim() && username.trim() && room.trim()) {
      socket.emit("send_message", { username, text: message, room });
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Socket.IO Chat</h2>

      {!username ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "10px", width: "70%" }}
          />
        </div>
      ) : !room ? (
        <div>
          <input
            type="text"
            placeholder="Enter room name"
            onChange={(e) => setRoom(e.target.value)}
            style={{ padding: "10px", width: "70%" }}
          />
        </div>
      ) : (
        <>
          <form onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              style={{ padding: "10px", width: "70%" }}
            />
            <button type="submit" style={{ padding: "10px" }}>
              Send
            </button>
          </form>
          <div style={{ marginTop: "20px" }}>
            {chat.map((msg, index) => (
              <p key={index}>
                <strong>{msg.username}: </strong> {msg.text}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
