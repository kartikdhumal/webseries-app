import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config';
import { authorizeUser } from './middlewares/authorization.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import constMiddleware from './middlewares/custommiddleware.js';

import User from './models/users.models.js';
import WebSeries from './models/webseries.models.js';
import connectMongoDB from './db/database.js';

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

await connectMongoDB();

app.get('/', (req, res) => {
    res.json("Hello World from Kartik Dhumal");
});

app.listen(PORT, async () => {
    await connectMongoDB();
    console.log(`The server is running on http://localhost:${PORT}`);
});

app.get('/getseries', authorizeUser, async (req, res) => {
    try {
        const webSeries = await WebSeries.find();
        res.status(200).json({ message: "Web series fetched successfully", webSeries });
    } catch (err) {
        console.error("Error fetching web series:", err);
        res.status(500).json({ message: "Failed to fetch web series", error: err.message });
    }
});

app.post('/postseries', authorizeUser, async (req, res) => {
    const { webSeries } = req.body;

    try {
        const newWebSeries = new WebSeries({
            title: webSeries.title,
            genre: webSeries.genre,
            release_year: webSeries.release_year,
            rating: webSeries.rating
        });

        const savedWebSeries = await newWebSeries.save();
        res.status(200).json({ message: "Data inserted successfully", webSeriesId: savedWebSeries._id });
    } catch (err) {
        console.error("Error inserting data: ", err);
        res.status(500).json({ message: "Failed to insert data", error: err.message });
    }
});

app.get('/getseries/:id', authorizeUser, async (req, res) => {
    const id = req.params.id;

    try {
        const webSeries = await WebSeries.findById(id);
        if (!webSeries) {
            return res.status(404).json({ message: "Web series not found" });
        }
        res.status(200).json(webSeries);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Failed to fetch web series", error: err.message });
    }
});

app.put('/updateseries/:id', authorizeUser, async (req, res) => {
    const id = req.params.id;
    const { title, genre, release_year, rating } = req.body;

    try {
        const updatedWebSeries = await WebSeries.findByIdAndUpdate(
            id,
            { title, genre, release_year, rating },
            { new: true }
        );

        if (!updatedWebSeries) {
            return res.status(404).json({ message: "Web series not found" });
        }

        res.status(200).json({ message: "Web series updated successfully", updatedWebSeries });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Failed to update web series", error: err.message });
    }
});

app.delete('/deleteseries/:id', authorizeUser, async (req, res) => {
    const id = req.params.id;

    try {
        const deletedWebSeries = await WebSeries.findByIdAndDelete(id);

        if (!deletedWebSeries) {
            return res.status(404).json({ message: "Web series not found" });
        }

        res.status(200).json({ message: "Web series deleted successfully" });
    } catch (err) {
        console.error("Error deleting web series:", err);
        res.status(500).json({ message: "Failed to delete web series", error: err.message });
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const newUser = new User({
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({ id: savedUser._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        res.status(500).json({ message: "Failed to register user", error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Failed to login user", error: err.message });
    }
});

app.get('/getuserdetails', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(400).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, email, exp } = decoded;
        return res.status(200).json({ id, email, exp });
    } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

app.use(constMiddleware);
