import mongoose from "mongoose";
import connectMongoDB from "../db/database";
import WebSeries from "../models/webseries.models.js";
import app from "../index.js";
import supertest from "supertest";

let server;
beforeAll(() => {
    connectMongoDB();
    server = app.listen(4000);
})

afterAll(() => {
    mongoose.connection.close();
    server.close();
});

// app.get('/getuserdetails', (req, res) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     if (!token) {
//         return res.status(400).json({ error: 'No token provided' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const { id, email, exp, isAdmin } = decoded;
//         return res.status(200).json({ id, email, exp, isAdmin });
//     } catch (error) {
//         console.error('Error decoding token:', error);
//         return res.status(401).json({ error: 'Invalid or expired token' });
//     }
// });

describe('GET /getseries', () => {
    let token;
    it("should login and fetch a token", async () => {
        const response = await supertest(app).post('/login').send({
            email: "kartik@gmail.com",
            password: "kartik@123"
        })
        console.log("Token : " + response.body.token);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        token = response.body.token;
        expect(token).toBeDefined();

    });

    it("should get user details using the token", async () => {
        const response = await supertest(app).get('/getuserdetails').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        const { id, email, exp, isAdmin } = response.body;
        expect(id).toBeDefined();
        expect(email).toBe("kartik@gmail.com");
        expect(exp).toBeDefined();
        expect(isAdmin).toBeTruthy();
    });

    it("should fetch details", async () => {
        const response = await supertest(app).get('/getseries').set('Authorization', `Bearer ${token}`);
        expect(response.body.webSeries.length).toBe(3);
    })
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});
