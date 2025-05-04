import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Initialize socket connection to the server
const socket = io("http://localhost:5000");

function App() {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState(""); // To store the username
  const [chat, setChat] = useState([]);

  // Effect hook to listen for messages from the server
  useEffect(() => {
    // Listening for incoming messages
    socket.on("receive_message", (data) => {
      setChat((prevChat) => [...prevChat, `${data.username}: ${data.text}`]);
    });

    // Clean up the socket listener on component unmount
    return () => socket.off("receive_message");
  }, []);

  // Function to handle sending messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username.trim()) {
      // Emit the message with both username and text
      socket.emit("send_message", { username, text: message });
      setMessage(""); // Clear the message input after sending
    } else {
      alert("Please enter both a username and a message!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Socket.IO Chat</h2>

      {/* Username input */}
      <div style={{ marginBottom: "10px" }}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          style={{ padding: "10px", width: "70%" }}
        />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          style={{ padding: "10px", width: "70%" }}
        />
        <button type="submit" style={{ padding: "10px" }}>Send</button>
      </form>

      {/* Display the chat messages */}
      <div style={{ marginTop: "20px" }}>
        {chat.map((msg, index) => (
          <p key={index} style={{ background: "#eee", padding: "5px" }}>
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
