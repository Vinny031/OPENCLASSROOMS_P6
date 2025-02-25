const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config({ path: ".env" });

const app = express();
const Book = require('./models/book');

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization']
}));

app.post('/api/stuff', (req, res, next) => {
    delete req.body._id;
    const book = new Book({
        ...req.body,
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre ajouté avec succès' }))
        .catch(error => res.status(400).json({ error: error.message }));
});

app.get('/api/book', (req, res, next) => {
    const book = [
      {
        _id: 'oeihfzeoi',
        title: 'Mon premier objet',
        description: 'Les infos de mon premier objet',
        imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
        price: 4900,
        userId: 'qsomihvqios',
      },
      {
        _id: 'oeihfzeomoihi',
        title: 'Mon deuxième objet',
        description: 'Les infos de mon deuxième objet',
        imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
        price: 2900,
        userId: 'qsomihvqios',
      },
    ];
    res.status(200).json(book);
  });

mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log('✅ Connexion à MongoDB réussie !'))
    .catch(err => console.error('❌ Connexion à MongoDB échouée !', err));


module.exports = app;