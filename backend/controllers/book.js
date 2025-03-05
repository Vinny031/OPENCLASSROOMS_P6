const Book = require('../models/book');
const fs = require('fs');

// Création d'un nouveau livre
exports.createBook = (req, res, next) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;

// Crée un nouvel objet Book avec les informations reçues
        const book = new Book({
            ...bookObject, 
            _userId: req.auth.userId,
            imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
        });

// Sauvegarde le livre dans la base de données
        book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error: error.message }));
    } catch (error) {
        res.status(400).json({ error: 'Données invalides' });
    }
}

// Récupération d'un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé!' });
      res.status(200).json(book);
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

// Modification d'un livre
exports.updateBook = (req, res, next) => {
  // Prépare les nouvelles données du livre, incluant éventuellement une nouvelle image
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  const { rating, userId } = req.body;
  delete bookObject._userId;

  // Recherche le livre à modifier
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé!' });
      if (book.userId !== req.auth.userId) return res.status(401).json({ message: 'Non autorisé' });

      // Gestion des notes
      if (rating && userId) {
        const grade = Number(rating);
        if (grade < 1 || grade > 5) {
          return res.status(400).json({ message: "La note doit être comprise entre 1 et 5." });
        }

        const existingRatingIndex = book.ratings.findIndex(rating => rating.userId.toString() === userId);
        if (existingRatingIndex > -1) {
          // Mise à jour de la note existante
          book.ratings[existingRatingIndex].grade = grade;
        } else {
          // Ajout d'une nouvelle note
          book.ratings.push({ userId, grade });
        }

        // Recalcul de la moyenne des notes
        const totalGrade = book.ratings.reduce((accumulator, currentValue) => accumulator + currentValue.grade, 0);
        book.averageRating = parseFloat((totalGrade / book.ratings.length).toFixed(1));
      }
      // Mise à jour du livre
      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => {
          if (req.file && book.imageUrl) {
            const imagePath = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${imagePath}`, err => {
              if (err) console.error(`Erreur lors de la suppression de l'image: ${err.message}`);
            });
          }
          res.status(200).json({ message: 'Livre modifié!' });
        })
        .catch(error => res.status(400).json({ error: `Erreur de mise à jour: ${error.message}` }));
    })
      .catch(error => res.status(500).json({ error: `Erreur lors de la recherche: ${error.message}` }));
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

// Ajout d'une note à un livre
exports.rateBook = (req, res, next) => {
    const userId = req.body.userId;
    const grade = Number(req.body.rating);
  
    // Vérifie que la note est comprise entre 1 et 5
    if (grade < 1 || grade > 5) {
      return res.status(400).json({ message: "La note doit être comprise entre 1 et 5." });
    }
  // Recherche le livre à noter
    Book.findOne({ _id: req.params.id })
      .then(book => {
        if (!book) {
          return res.status(404).json({ message: "Livre non trouvé!" });
        }
  
        // Vérifie que l'utilisateur n'a pas déjà noté ce livre
        const existingRatingIndex = book.ratings.findIndex(rating => rating.userId.toString() === userId);
        if (existingRatingIndex > -1) {
          return res.status(400).json({ message: "L'utilisateur a déjà noté ce livre" });
        }
  
        // Ajoute la nouvelle note au tableau des notes du livre
        book.ratings.push({ userId, grade });
  
        // Recalcul de la moyenne des notes
        const totalGrade = book.ratings.reduce((accumulator, currentValue) => accumulator + currentValue.grade, 0);
        book.averageRating = parseFloat((totalGrade / book.ratings.length).toFixed(1));
  
        // Sauvegarde les modifications dans la base de données
        book.save()
          .then(() => res.status(200).json(book))
          .catch(error => res.status(500).json({ error: 'Erreur lors de la sauvegarde de la note' }));
      })
      .catch(error => res.status(500).json({ error: 'Erreur lors de la recherche du livre' }));
  };

  // Récupération de tous les livre
exports.getAllBooks = (req, res, next) => {
  Book.find()
      .then(Books => res.status(200).json(Books))
      .catch(error => res.status(400).json({ error }));
}

// Récupération des livres les mieux notés
exports.bestRatings = (req, res, next) => {
  console.log('Fetching best rated books');
  Book.find()
  .sort({ averageRating: -1 })
  .limit(5)
  .then(books => {
    if (!books.length) {
      return res.status(404).json({ message: 'Aucun livre trouvé.' });
    }
    res.status(200).json(books);
  })
  .catch(error => {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur serveur, impossible de récupérer les livres' });
  });

};