const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config({ path: ".env" });

const app = express();
const bookRoutes = require('./routes/book');
console.log('Routes chargées:', bookRoutes.stack);
const userRoutes = require('./routes/user');

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization']
}));

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static('images'));
app.use(express.static('public')); 

mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log('✅ Connexion à MongoDB réussie !'))
    .catch(err => console.error('❌ Connexion à MongoDB échouée !', err));


module.exports = app;