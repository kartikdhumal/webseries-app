import { useState, useEffect } from 'react';
import axios from 'axios';

const GetUserDetailsFromToken = (token) => {
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!token) return;

            try {
                const response = await axios.get('http://localhost:3000/getuserdetails', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const { id, email, exp } = response.data;
                setUserDetails({ id, email, exp });
            } catch (error) {
                console.error('Error fetching user details:', error);
                setUserDetails(null);
            }
        };

        fetchUserDetails();
    }, [token]);

    return userDetails;
};

export default GetUserDetailsFromToken;
