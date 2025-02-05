import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../styles/MyChat.css';

const socket = io('http://localhost:3000');

const MyChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on('chatMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('chatMessage');
        };
    }, []);

    const sendMessage = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const time = `${hours}:${minutes}`;

        const messageData = {
            text: message,
            time: time,
        };

        socket.emit('chatMessage', messageData);
        setMessage('');  // Clear input after sending
    };

    return (
        <div className="maincontainer">
            <div className="chat-container">
                <div className="chat-header">
                    <h2>Kartik's Chat App</h2>
                </div>
                <div className="message-box">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${(idx + 1) % 2 === 0 ? 'received' : 'sent'}`}>
                            <p>{msg.text}</p>
                            <p className="time">{msg.time}</p>
                        </div>
                    ))}
                </div>
                <div className="myinput-container">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        className="myinput-field"
                    />
                    <button className="send-btn" onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default MyChat;
