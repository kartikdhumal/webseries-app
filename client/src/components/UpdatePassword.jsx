import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

function UpdatePassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState(null);
    const email = location.state;

    useEffect(() => {
        if (email) {
            axios.get('http://localhost:3000/getusers')
                .then(response => {
                    const user = response.data.users.find(user => user.email === email);
                    if (user) {
                        setUserId(user._id);
                    } else {
                        setMessage('User not found');
                    }
                })
                .catch(err => {
                    console.error('Error fetching user:', err);
                    setMessage('An error occurred. Please try again later.');
                });
        }
    }, [email]);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setMessage('Both fields are required.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        if (userId) {
            try {
                const response = await axios.put(`http://localhost:3000/updatepassword/${userId}`, {
                    password: password
                });
                if (response.data.success) {
                    alert('Password updated successfully');
                    navigate('/login');
                } else {
                    setMessage('Failed to update password');
                }
            } catch (error) {
                console.error('Error updating password:', error);
                setMessage('An error occurred. Please try again later.');
            }
        } else {
            setMessage('User not found.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Update Password for {email} </h1>
                <form onSubmit={handlePasswordUpdate}>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Update Password</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default UpdatePassword;
