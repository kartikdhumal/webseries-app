// import jwt from 'jsonwebtoken';
// import 'dotenv/config'
// import console from '../utils/console.js';

// export const authorizeUser = async (req, res, next) => {
//     try {
//         const authHeader = req.headers['authorization'] || req.headers['Authorization'];

//         if (!authHeader) {
//             console.error("No authorization header provided");
//             return res.status(401).json({ message: "No authorization header provided" });
//         }

//         if (!authHeader.startsWith("Bearer ")) {
//             console.error("Invalid token format");
//             return res.status(400).json({ message: "Invalid token format" });
//         }

//         const token = authHeader.split(" ")[1];

//         if (!token) {
//             console.error("Token is missing");
//             return res.status(401).json({ message: "Token is missing" });
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             if (!decoded.id) {
//                 console.error("Decoded token is missing required fields");
//                 return res.status(400).json({ message: "Invalid token" });
//             }

//             req.user = decoded;
//             next();
//         } catch (error) {
//             console.error(`JWT verification error: ${error.message}`);
//             return res.status(403).json({ message: "Invalid or expired token" });
//         }

//     } catch (error) {
//         console.error("Error in middleware:", error.message);
//         return res.status(500).json({ message: "Server error" });
//     }
// };


import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authorizeUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];

        if (!authHeader) {
            console.error("No authorization header provided");
            return res.status(401).json({ message: "No authorization header provided" });
        }

        if (!authHeader.startsWith("Bearer ")) {
            console.error("Invalid token format");
            return res.status(400).json({ message: "Invalid token format" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            console.error("Token is missing");
            return res.status(401).json({ message: "Token is missing" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded.id) {
                console.error("Decoded token is missing required fields");
                return res.status(400).json({ message: "Invalid token" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            console.error(`JWT verification error: ${error.message}`);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

    } catch (error) {
        console.error(`Error in middleware: ${error.message}`);
        return res.status(500).json({ message: "Server error" });
    }
};
