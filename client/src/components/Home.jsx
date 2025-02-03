import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import GetUserDetailsFromToken from './IdentifyUser';

const Home = () => {

    const navigate = useNavigate();

    const [webSeries, setWebSeries] = useState({
        title: '',
        genre: '',
        release_year: '',
        rating: ''
    });
    const [webSeriesList, setWebSeriesList] = useState([]);

    const getTokenFromLocalStorage = () => {
        const token = localStorage.getItem('token');
        return token ? token : null;
    };

    const token = getTokenFromLocalStorage();

    const userDetails = GetUserDetailsFromToken(token);


    useEffect(() => {
        if (!userDetails) return;

        const currentTime = Date.now() / 1000;
        if (userDetails && userDetails.exp < currentTime) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [userDetails, navigate]);



    const fetchSeriesData = async () => {
        try {
            const token = getTokenFromLocalStorage();
            const response = await axios.get('https://webseries-server.vercel.app/getseries', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // const response = await fetch('https://webseries-server.vercel.app/getseries', {
            //     method: 'GET',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json'
            //     }
            // });

            if (response.data.webSeries) {
                setWebSeriesList(response.data.webSeries);
            }
        } catch (error) {
            console.error('Error fetching web series:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWebSeries(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        const token = getTokenFromLocalStorage();
        if (!token) {
            console.log('Unauthorized access. Please log in.');
            navigate('/login');
        }
    }, [navigate]);


    const handleSubmit = async (e) => {
        const token = getTokenFromLocalStorage();
        e.preventDefault();
        try {
            await axios.post('https://webseries-server.vercel.app/postseries', {
                webSeries
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Web series added successfully");
            setWebSeries({ title: '', genre: '', release_year: '', rating: '' });
            fetchSeriesData();
        } catch (error) {
            console.error('Error posting web series:', error);
        }
    };

    const deleteWebSeries = async (id) => {
        try {
            const token = getTokenFromLocalStorage();
            await axios.delete(`https://webseries-server.vercel.app/deleteseries/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Deleted successfully");
            fetchSeriesData();
        } catch (error) {
            console.error('Error deleting web series:', error);
        }
    };

    useEffect(() => {
        fetchSeriesData();
    }, []);

    return (
        <div className="form-container">
            <div>
                {userDetails ? (
                    <div className="welcome-container">
                        <h2 className="welcome-title">Welcome, {userDetails.email.split("@")[0].toUpperCase()}!</h2>
                        <p className="welcome-email">Email: {userDetails.email}</p>
                    </div>
                ) : (
                    <p>Please log in to view your details.</p>
                )}
            </div>

            <p className="logout-text"
                style={{ cursor: "pointer" }}
                onClick={() => {
                    alert("Logged out successfully")
                    localStorage.removeItem('token');
                    navigate('/login');
                }}
            >
                Log out
            </p>
            <h2 className="form-title">Add New Web Series</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="title">Web Series Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={webSeries.title}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="genre">Genre</label>
                    <input
                        type="text"
                        id="genre"
                        name="genre"
                        value={webSeries.genre}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="release_year">Release Year</label>
                    <input
                        type="number"
                        id="release_year"
                        name="release_year"
                        value={webSeries.release_year}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="rating">Rating</label>
                    <input
                        type="number"
                        step="0.1"
                        id="rating"
                        name="rating"
                        value={webSeries.rating}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                    />
                </div>

                <button type="submit" className="submit-button">Submit</button>
            </form>

            <div className="table-container">
                <h2 className="table-title">Web Series List</h2>
                {webSeriesList.length === 0 ? (
                    <p>No web series found</p>
                ) : (
                    <table className="web-series-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Genre</th>
                                <th>Release Year</th>
                                <th>Rating</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {webSeriesList.map((series, index) => (
                                <tr key={index}>
                                    <td>{series.title}</td>
                                    <td>{series.genre}</td>
                                    <td>{series.release_year}</td>
                                    <td>{series.rating}</td>
                                    <td>
                                        <button className='edit-button' onClick={() => navigate(`/editshow/${series._id}`)}>Edit</button> </td>
                                    <td><button className='delete-button' onClick={() => deleteWebSeries(series._id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Home;
