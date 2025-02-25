const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete thingObject._id;
    delete thingObject._userId;
    const book = new Book({
        ...thingObject, 
        _userId: req.auth.userId,
        imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré.' }))
        .catch(error => res.status(400).json({ error }));
}

exports.updateThing = (req, res, next) => {
    const thingObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
        }
        : { ...req.body };
    delete thingObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !' });
            }
            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé !' });
            }
            Book.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre mit à jour.' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.deleteThing = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé!' });
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


exports.getOneThing = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ message: 'Livre introuvable.' }));
}

exports.getAllThings = (req, res, next) => {
    Book.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
}