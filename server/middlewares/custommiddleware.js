import logger from "../utils/logger.js";

const constMiddleware = async (err, req, res, next) => {
    logger.error(err.message);
    if (err.message === "No authorization header provided") {
        return res.status(401).json({ message: err.message });
    } else if (err.message === "Invalid token format" || err.message === "Token is missing") {
        return res.status(400).json({ message: err.message });
    } else if (err.message === "Invalid or expired token" || err.message === "Invalid token") {
        return res.status(403).json({ message: err.message });
    } else if (err.message === "Server error") {
        return res.status(500).json({ message: "Internal Server Error" });
    } else {
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
}


export default constMiddleware;