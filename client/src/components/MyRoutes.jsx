import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../components/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import EditShow from "../components/EditShow";
import Customer from "./Customer";
import SendEmail from "./SendEmail";
import OTP from "./OTP";
import UpdatePassword from "./UpdatePassword";
import AddUser from "./AddUser";

const MyRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/register" element={<Register />} />
                <Route path="/editshow/:id" element={<EditShow />} />
                <Route path="/sendemail" element={<SendEmail />} />
                <Route path="/sendotp" element={<OTP />} />
                <Route path="/updatepassword" element={<UpdatePassword />} />
                <Route path="/adduser" element={<AddUser/>} />
            </Routes>
        </Router>
    );
};

export default MyRoutes;
