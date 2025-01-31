import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../components/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import EditShow from "../components/EditShow";

const MyRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/editshow/:id" element={<EditShow />} />
            </Routes>
        </Router>
    );
};

export default MyRoutes;
