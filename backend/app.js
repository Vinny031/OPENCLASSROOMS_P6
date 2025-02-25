const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config({ path: ".env" });

const app = express();
const bookRoutes = require('./routes/book');

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization']
}));

app.use('/api/book', bookRoutes);
app.use('/api/auth', userRoutes);

mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log('✅ Connexion à MongoDB réussie !'))
    .catch(err => console.error('❌ Connexion à MongoDB échouée !', err));


module.exports = app;