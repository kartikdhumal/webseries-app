import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AddUsers.css';

function AddUser() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('User');
    const [usersList, setUsersList] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://webseries-server.vercel.app/getusers');
            setUsersList(response.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const isAdmin = role === 'Admin' ? true : false;

        const userData = {
            email,
            password,
            isAdmin
        };


        try {
            await axios.post('https://webseries-server.vercel.app/adduser', userData);
            alert('User added successfully!');
            fetchUsers();
            setConfirmPassword('');
            setEmail('');
            setPassword('');
            setRole('User');

        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user, please try again.');
        }
    };

    const deleteUser = async (userId) => {
        try {
            await axios.delete(`https://webseries-server.vercel.app/deleteuser/${userId}`);
            alert('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user, please try again.');
        }
    };

    return (
        <div className="my-container">
            <div className="auth-box">
                <h1>Add User</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="" selected disabled>Select Role</option>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button type="submit">Add User</button>
                </form>
            </div>

            <div className="table-container">
                <h2 className="table-title">User List</h2>
                {usersList.length === 0 ? (
                    <p>No users found</p>
                ) : (
                    <table className="web-series-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.email}</td>
                                    <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                                    <td>
                                        <button className="delete-button" onClick={() => deleteUser(user._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AddUser;
