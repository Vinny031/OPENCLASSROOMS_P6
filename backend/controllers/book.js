const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete BookObject._id;
    delete BookObject._userId;
    const book = new Book({
        ...BookObject, 
        _userId: req.auth.userId,
        imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré.' }))
        .catch(error => res.status(400).json({ error }));
}

exports.updateBook = (req, res, next) => {
    const BookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
        }
        : { ...req.body };
    delete BookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !' });
            }
            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé !' });
            }
            Book.updateOne({ _id: req.params.id }, { ...BookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre mit à jour.' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé !' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink('images/' + filename, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé.' }))
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};


exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ message: 'Livre introuvable.' }));
}

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(Books => res.status(200).json(Books))
        .catch(error => res.status(400).json({ error }));
}