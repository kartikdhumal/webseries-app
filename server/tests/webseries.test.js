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

    // it("should send details", async () => {
    //     const webSeries = {
    //         title: "Scam 1992",
    //         genre: "Thriller",
    //         release_year: 2020,
    //         rating: 9.3
    //     }
    //     const response = await supertest(app).post('/postseries').set('Authorization', `Bearer ${token}`).send({ webSeries });
    //     console.log("Full Response:", response.body);
    //     expect(response.status).toBe(200);
    //     expect(response.body.message).toBe("Data inserted successfully");
    // })

    // it("should update details", async () => {
    //     const webSeries = {
    //         title: "Panchayat 3",
    //         genre: "drama",
    //         release_year: 2024,
    //         rating: 9.6
    //     }
    //     const response = await supertest(app).get('/getseries').set('Authorization', `Bearer ${token}`);
    //     const webseries = response.body.webSeries.filter((series) => series.title === "Delhi crime");
    //     const updateresponse = await supertest(app).put(`/updateseries/${webseries[0]._id}`).set('Authorization', `Bearer ${token}`).send(webSeries);
    //     expect(updateresponse.status).toBe(200);
    //     expect(updateresponse.body.message).toBe("Web series updated successfully");
    //     expect(updateresponse.body.updatedWebSeries).toEqual(
    //         expect.objectContaining(webSeries)
    //     );
    // })

    // it("Should delete Web series", async () => {
    //     const response = await supertest(app)
    //         .get('/getseries')
    //         .set('Authorization', `Bearer ${token}`);

    //     expect(response.status).toBe(200);
    //     expect(response.body.message).toBe("Web series fetched successfully");

    //     const webseries = response.body.webSeries.find(series => series.title === "Panchayat 3");

    //     expect(webseries).toBeDefined();

    //     const deleteResponse = await supertest(app)
    //         .delete(`/deleteseries/${webseries._id}`)
    //         .set('Authorization', `Bearer ${token}`);

    //     expect(deleteResponse.status).toBe(200);
    //     expect(deleteResponse.body.message).toBe("Web series deleted successfully");
    // });


});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});
