import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Home.css';
import GetUserDetailsFromToken from './IdentifyUser';

const EditShow = () => {
    const [webSeries, setWebSeries] = useState({
        title: '',
        genre: '',
        release_year: '',
        rating: ''
    });

    const { id } = useParams();
    const navigate = useNavigate();

    const token = getTokenFromLocalStorage();
    const { userDetails, loading, error } = GetUserDetailsFromToken(token);

    useEffect(() => {
        if (loading) return;

        if (error) {
            console.log(error);
            return;
        }

        const currentTime = Date.now() / 1000;
        if (userDetails && userDetails.exp < currentTime) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [userDetails, loading, error, navigate]);

    const getTokenFromLocalStorage = () => {
        const token = localStorage.getItem('token');
        return token ? token : null;
    };

    const fetchSeriesData = async () => {
        try {
            const token = getTokenFromLocalStorage();
            const response = await axios.get(`https://webseries-server.vercel.app/getseries/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                setWebSeries(response.data);
            }
        } catch (error) {
            console.error('Error fetching web series:', error);
        }
    };

    useEffect(() => {
        const token = getTokenFromLocalStorage();
        if (!token) {
            console.log('Unauthorized access. Please log in.');
            navigate('/login');
        }
    }, [navigate]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWebSeries(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getTokenFromLocalStorage();
            await axios.put(`https://webseries-server.vercel.app/updateseries/${id}`, webSeries, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Web series updated successfully");
            navigate('/');
        } catch (error) {
            console.error('Error updating web series:', error);
        }
    };

    useEffect(() => {
        fetchSeriesData();
    }, [id]);

    return (
        <div className="form-container">
            <h2 className="form-title">Edit Web Series</h2>
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
        </div>
    );
};

export default EditShow;
