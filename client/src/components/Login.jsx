import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const fetchUserDetails = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get('https://webseries-server.vercel.app/getuserdetails', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const { id, email, exp, isAdmin } = response.data;
      return { id, email, exp, isAdmin }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://webseries-server.vercel.app/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const userDetails = fetchUserDetails(token);
      userDetails.then((res) => {
        if (res.isAdmin) {
          alert(`ADMIN - ${response.data.message}`);
          navigate('/home');
        } else {
          alert(response.data.message);
          navigate('/customer');
        }
      });
    } catch (error) {
      console.error(error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p> Account not created ? <Link to="/register">Register here</Link></p>
        <p><Link to="/sendemail">Forgot Password?</Link></p>
      </div>
    </div>
  );
}

export default Login;