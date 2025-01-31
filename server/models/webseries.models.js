import mongoose from 'mongoose';

const webSeriesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    release_year: { type: Number, required: true },
    rating: { type: Number, required: true }
});

const WebSeries = mongoose.model('WebSeries', webSeriesSchema);

export default WebSeries;
