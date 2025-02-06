import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config';
import { authorizeUser } from './middlewares/authorization.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import constMiddleware from './middlewares/custommiddleware.js';
import { Server } from 'socket.io';
import User from './models/users.models.js';
import WebSeries from './models/webseries.models.js';
import connectMongoDB from './db/database.js';
import path from 'path'
import multer from 'multer';
import fs from 'fs'

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

connectMongoDB();

app.get('/', (req, res) => {
    res.json("Hello World from Kartik Dhumal");
});

const server = app.listen(PORT, async () => {
    await connectMongoDB();
    console.log(`The server is running on http://localhost:${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const __dirname = path.resolve();

const IMAGE_DIR = '/tmp/uploads';
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: IMAGE_DIR,
    filename: (req, file, cb) => {
        cb(null, `image_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

app.use('/uploads', express.static(IMAGE_DIR));


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('connect', () => {
        console.log('Socket connected');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });


    socket.on('chatMessage', (data) => {
        console.log('Received chat message:', data);

        io.emit('chatMessage', data);
    });

    socket.on('sendImage', (fileBuffer) => {
        const fileName = `image_${Date.now()}.png`;
        const filePath = path.join(IMAGE_DIR, fileName);

        fs.writeFile(filePath, fileBuffer, (err) => {
            if (err) {
                console.error('Error saving image:', err);
                return;
            }

            io.emit('chatMessage', {
                image: `http://localhost:3000/uploads/${fileName}`,
                userId: socket.id
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
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

app.get('/getusers', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users", error: err.message });
    }
});


app.delete('/deleteuser/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

app.post('/adduser', async (req, res) => {
    const { email, password, isAdmin } = req.body;

    if (!email || !password || isAdmin === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const newUser = new User({
            email,
            password,
            isAdmin,
        });

        await newUser.save();
        res.status(201).json({ message: 'User added successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/postseries', authorizeUser, async (req, res) => {
    const { webSeries } = req.body;

    try {

        const existing = await WebSeries.findOne({ title: webSeries.title });
        if (existing) {
            return res.status(400).json({ message: "Series with this title already exists" });
        }

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

app.put('/updatepassword/:id', async (req, res) => {
    const { password } = req.body;
    const { id } = req.params;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the password', error: error.message });
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

        const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
        const { id, email, exp, isAdmin } = decoded;
        return res.status(200).json({ id, email, exp, isAdmin });
    } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

app.use(constMiddleware);
export default app;