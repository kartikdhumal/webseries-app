import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../styles/MyChat.css';
import { FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { IoMdAttach } from "react-icons/io";

const socket = io('https://webseries-server.vercel.app');

const MyChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [file, setFile] = useState('');

    useEffect(() => {
        socket.on('chatMessage', (data) => {
            console.log(data, "datappp");
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('chatMessage');
        };
    }, []);

    const sendMessage = () => {
        if (!message.trim()) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const time = `${hours}:${minutes}`;

        const formData = new FormData();
        formData.append('image', file);

        const messageData = {
            text: message,
            time: time,
            file: file,
            userId: socket.id
        };

        socket.emit('chatMessage', messageData);
        setMessage('');
    };

    const handleEmojiClick = (emojiData) => {
        setMessage((prevMessage) => prevMessage + emojiData.emoji);
    };

    const handleFileUpload = (event) => {
        setFile(event.target.files[0]);
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        socket.emit('sendImage', file);
    };

    return (
        <div className="maincontainer">
            <div className="chat-container">
                <div className="chat-header">
                    <h2> Kartik&apos;s WhatsApp</h2>
                </div>
                <div className="message-box">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.userId !== socket.id ? 'received' : 'sent'}`}>
                            <p>{msg.text}</p>
                            {msg.image && <img src={msg.image} alt="Sent" className="sent-image" />}
                            <p className="time">{msg.time}</p>
                            {msg.userId === socket.id && (
                                <img className='seen' src={'../../public/bluetick.png'} alt="Blue Tick" />
                            )}
                        </div>
                    ))}
                </div>
                <div className="myinput-container">
                    <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <FaSmile size={24} />
                    </button>

                    <label>
                        <IoMdAttach size={30} className='attach-file' />
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </label>

                    {showEmojiPicker && (
                        <div className="emoji-picker">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
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
