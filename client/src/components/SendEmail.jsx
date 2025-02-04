import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import emailjs from 'emailjs-com';
import '../styles/Auth.css';

function SendEmail() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSendEmail = async (e) => {
        e.preventDefault();

        try {

            const response = await axios.get('http://localhost:3000/getusers');

            const userExists = response.data.users.some(user => user.email === email);

            if (userExists) {

                const otp = Math.floor(1000 + Math.random() * 9000);

                const templateParams = {
                    to_email: email,
                    subject: 'Your OTP for resetting password',
                    message: otp,
                };


                emailjs.send("service_m70sn8f", "template_2pov6dk", templateParams, "UotkyMsCOj0Jq6E4g")
                    .then((response) => {
                        alert("Email sent to " + email);
                        console.log('Email sent successfully:', response);
                        navigate('/sendotp', { state: { otp , email } });
                    })
                    .catch((error) => {
                        console.error('Error sending email:', error);
                        setMessage('Failed to send OTP, please try again later.');
                    });
            } else {
                setMessage('No user found with this email');
            }
        } catch (error) {
            console.error('Error during email sending:', error);
            setMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Enter Email</h1>
                <form onSubmit={handleSendEmail}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send OTP</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default SendEmail;
