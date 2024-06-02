const express = require('express');
const router = express.Router();
const Book = require('../models/Book')
const books = require('../../frontend/public/data/data.json')

router.post('/', (req, res, next) => {

const Newbook = new Book({
...req.body
});
Newbook.save()
.then(() => res.status(201).json({ message: 'livre enregistré!' }))
.catch(error => res.status(400).json({ error }));

});
router.post('/:id/rating', (req, res, next) => {
    const bookId = req.params.id;
    const { userId, rating } = req.body;

    // Vérifier si la note est dans la plage valide (entre 0 et 5)
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5' });
    }

    // Trouver le livre dans la liste des livres
    const book = books.find(b => b.id === bookId);
    if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà noté ce livre
    if (book.ratings.some(r => r.userId === userId)) {
        return res.status(400).json({ error: 'Vous avez déjà noté ce livre' });
    }

    // Ajouter la note à la liste des notes du livre
    book.ratings.push({ userId, rating });

    // Calculer la nouvelle moyenne des notes
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((acc, cur) => acc + cur.rating, 0);
    const averageRating = sumRatings / totalRatings;

    // Mettre à jour la moyenne des notes du livre
    book.averageRating = averageRating;

    // Retourner le livre mis à jour en réponse à la requête
    res.status(200).json(book);
});

// Route pour renvoyer tous les livres
router.get('/', (req,res, next) => {
    res.status(200).json(books);
});

// Route pour renvoyer un livre spécifique par ID
router.get('/:id', (req,res, next) => {
    const bookId = req.params.id;
    const book = books.find(b => b.id === bookId);
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

// Route pour renvoyer les 3 livres ayant la meilleure note moyenne
router.get('/bestrating', (req,res, next) => {
    const sortedBooks = books.sort((a,b) => b.averageRating - a.averageRating)
    const topBooks = sortedBooks.slice(0, 3)
    res.status(200).json(topBooks);
});

module.exports = router;