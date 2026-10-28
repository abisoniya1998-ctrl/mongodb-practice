const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(' mongodb://127.0.0.1:27017/school').then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});