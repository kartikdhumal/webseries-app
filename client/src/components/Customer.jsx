import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Customer.css'
import GetUserDetailsFromToken from './IdentifyUser';

const getTokenFromLocalStorage = () => localStorage.getItem('token');

function Customer() {
    const [series, setSeries] = useState([]);
    const [filteredSeries, setFilteredSeries] = useState([]);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    function logOutUser(){
        localStorage.removeItem("token");
        alert("Log Out Successfull");
        navigate('/login');
    }

    const token = getTokenFromLocalStorage();

    const userDetails = GetUserDetailsFromToken(token);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setQuery(query);
        if (query.length >= 3) {
            const filtered = series.filter((show) =>
                show.title.toLowerCase().includes(query)
            );
            setFilteredSeries(filtered);
        } else {
            setFilteredSeries([]);
        }
    }

    useEffect(() => {
        const token = getTokenFromLocalStorage();
        if (!token) {
            console.log('Unauthorized access. Please log in.');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const token = getTokenFromLocalStorage();
                const response = await axios.get('http://localhost:3000/getseries', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.webSeries) setSeries(response.data.webSeries);
            } catch (error) {
                console.error('Error fetching series:', error);
            }
        };

        fetchSeries();
    }, []);

    return (
        <div className="customer-container">
            <nav className="navbar">
                <h1 className="logo">Kartik Prime</h1>
                <div className="searchbtn">
                    <div className="nav-links">
                        <input type='text' value={query} onChange={handleSearch} placeholder='Search movie/series...' className='searchbox' />
                    </div>
                    <div className="searchresult">
                        <div className="showlist">
                            {filteredSeries.length > 0 ? (
                                filteredSeries.map((show) => (
                                    <div key={show._id} className="search-card">
                                            {show.title}
                                    </div>
                                ))
                            ) : (
                                <p></p>
                            )}
                        </div>
                    </div>
                </div>
                <p> Welcome , {userDetails?.email.split("@")[0] || "user"} </p>
                <div className="userdetails" onClick={() => logOutUser()}>
                    Log out
                </div>
            </nav>

            <div className="series-grid">
                {series.map((show) => (
                    <div key={show._id} className="series-card">
                        <div className="series-info">
                            <h3>{show.title}</h3>
                            <p>{show.genre} | {show.release_year}</p>
                            <span className="rating">⭐ {show.rating}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Customer;
