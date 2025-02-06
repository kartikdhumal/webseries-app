import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/MyChat.css';
import { FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { IoMdAttach } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { IoMdSend } from "react-icons/io";
import dp from '/whatsappDP.jpg'

const socket = io('https://webseries-server.vercel.app', { transports: ['websocket'] });

const MyChat = () => {
    socket.on('connect', () => {
        console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from the server');
    });

    socket.on('respond', function (data) {
        console.log(data);
      });

    socket.on('connect_error', (err) => {
        console.log('Connection Error:', err);
    });

    socket.on('error', (err) => {
        console.error('Socket.io Error:', err);
    });

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [file, setFile] = useState('');
    const [filePreview, setFilePreview] = useState(null);
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [isNameEntered, setIsNameEntered] = useState(false);
    const [receiverName, setReceiverName] = useState("");
    const messagesEndRef = useRef(null);

    const [fooEvents, setFooEvents] = useState([]);

    useEffect(() => {
        // no-op if the socket is already connected
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        function onFooEvent(value) {
            setFooEvents(fooEvents.concat(value));
        }

        socket.on('foo', onFooEvent);

        return () => {
            socket.off('foo', onFooEvent);
        };
    }, [fooEvents]);


    const getUserId = () => {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = `user_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('userId', userId);
        }
        return userId;
    };

    const userId = getUserId();

    useEffect(() => {
        const receiver = messages.find((msg) => msg.userId !== userId);
        setReceiverName(receiver ? receiver.userName : "Anonymous");
    }, [messages, userId])


    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        socket.on('chatMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('chatMessage');
        };
    }, []);

    const sendMessage = () => {
        if (!message.trim() && !file) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const time = `${hours}:${minutes}`;

        const messageData = {
            text: message.trim() || null,
            time: time,
            file: null,
            userId: userId,
            userName: userName || 'Anonymous'
        };

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                messageData.file = reader.result;
                socket.emit('chatMessage', messageData);
            };
        } else {
            socket.emit('chatMessage', messageData);
        }

        setMessage('');
        setFile(null);
        setFilePreview(null);
    };

    const handleEmojiClick = (emojiData) => {
        setMessage((prevMessage) => prevMessage + emojiData.emoji);
    };

    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
    };

    const removeFile = () => {
        setFile(null);
        setFilePreview(null);
    };

    const handleNameSubmit = () => {
        if (userName.trim()) {
            localStorage.setItem('userName', userName);
            setIsNameEntered(true);
        }
    };

    return (
        <div className="maincontainer">
            {!isNameEntered ? (
                <div className="name-input">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={userName}
                        className='myinput'
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <button onClick={handleNameSubmit}>Submit</button>
                </div>
            ) : (
                <div className="chat-container">
                    <div className="chat-header">
                        <div className="profile-info">
                            <img src={dp} alt="Profile" className="profile-pic" />
                            <div className="details">
                                <p className='receiver'>{receiverName}</p>
                                <p className="wastatus">Online</p>
                            </div>
                        </div>
                    </div>
                    <div className="message-box">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.userId !== userId ? 'received' : 'sent'}`}>
                                {msg.file && (
                                    <div className="image-container">
                                        <img src={msg.file} alt="Sent" className="sent-image" />
                                        {msg.text && (
                                            <p className="caption">
                                                {msg.text}
                                            </p>
                                        )}
                                        <p className="imgtime">{msg.time}</p>
                                        {msg.userId === userId && (
                                            <img className='seen' src={'/bluetick.png'} alt="Blue Tick" />
                                        )}
                                    </div>
                                )}
                                {!msg.file && msg.text && (
                                    <>
                                        <p>{msg.text}</p>
                                        <p className="time">{msg.time}</p>
                                        {msg.userId === userId && (
                                            <img className='seen' src={'../../public/bluetick.png'} alt="Blue Tick" />
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="myinput-container">
                        <div className="myinput">

                        </div>
                        <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <FaSmile />
                        </button>

                        <div onClick={() => document.getElementById('file-upload').click()}>
                            <IoMdAttach className='attach-file' />
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />


                        {filePreview && (
                            <div className="file-preview">
                                <img src={filePreview} alt="Preview" className="preview-icon" />
                                <AiOutlineClose className="remove-file" onClick={removeFile} />
                            </div>
                        )}

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
                            placeholder={!filePreview ? "Type a message" : "Write a Caption"}
                            className={!filePreview ? "myinput-field" : "mycaption-field"}
                        />

                        <IoMdSend className="send-btn" onClick={sendMessage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyChat;
