import express from 'express';
import cors from 'cors'
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { authorizeUser } from './middlewares/authorization.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import constMiddleware from './middlewares/custommiddleware.js';

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

const connectMySQL = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
        });
        return connection;
    } catch (err) {
        console.error("MySQL connection error: ", err.message);
        throw err;
    }
};

app.get('/',(req,res) => {
     res.json("Hello World from Kartik Dhumal");
});

app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
})

app.get('/getseries', authorizeUser, async (req, res) => {
    const conn = await connectMySQL();
    const [rows] = await conn.execute("select * from webseries");
    res.status(200).json({ message: "Web series fetched successfully", rows });
})

app.post('/postseries', authorizeUser, async (req, res) => {
    const conn = await connectMySQL();
    const { webSeries } = req.body;

    try {
        const [webSeriesResult] = await conn.query(
            'INSERT INTO webseries (title, genre, release_year, rating) VALUES (?, ?, ?, ?)',
            [webSeries.title, webSeries.genre, webSeries.release_year, webSeries.rating]
        );
        res.status(200).json({ message: "Data inserted successfully", webSeriesId: webSeriesResult.insertId });
    } catch (err) {
        console.error("Error inserting data: ", err);
        res.status(500).json({ message: "Failed to insert data", error: err.message });
    }
});

app.get('/getseries/:id', authorizeUser, async (req, res) => {
    const conn = await connectMySQL();
    const id = req.params.id;

    try {
        const [rows] = await conn.execute('SELECT * FROM webseries WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Web series not found" });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Failed to fetch web series", error: err.message });
    }
});

app.put('/updateseries/:id', authorizeUser, async (req, res) => {
    const conn = await connectMySQL();
    const id = req.params.id;
    const { title, genre, release_year, rating } = req.body;

    try {
        const [result] = await conn.execute(
            'UPDATE webseries SET title = ?, genre = ?, release_year = ?, rating = ? WHERE id = ?',
            [title, genre, release_year, rating, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Web series not found" });
        }

        res.status(200).json({ message: "Web series updated successfully" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Failed to update web series", error: err.message });
    }
});

app.delete('/deleteseries/:id', authorizeUser, async (req, res) => {
    let conn;
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        conn = await connectMySQL();

        const [series] = await conn.execute('SELECT * FROM webseries WHERE id = ?', [id]);

        if (!series) {
            return res.status(404).json({ message: "Web series not found" });
        }

        await conn.execute('DELETE FROM webseries WHERE id = ?', [id]);

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
        const conn = await connectMySQL();
        const [existingUser] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const [result] = await conn.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
        const conn = await connectMySQL();
        const [user] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Failed to login user", error: err.message });
    }
});

app.get('/getuserdetails', (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
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
