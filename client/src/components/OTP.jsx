import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function OTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const otp = location.state?.otp;
    const email = location.state?.email;
    const [userOtp, setUserOtp] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (userOtp === String(otp)) {
            alert("OTP Verification Successfull");
            navigate('/updatepassword', { state: email });
        } else {
            setMessage('Invalid OTP, please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Enter OTP</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter 4-digit OTP"
                        value={userOtp}
                        onChange={(e) => setUserOtp(e.target.value)}
                        required
                        maxLength="4"
                        pattern="\d{4}"
                    />
                    <button type="submit">Verify OTP</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default OTP;
