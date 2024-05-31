const express = require('express');
const router = express.Router();
const Book = require('../models/Book')
const books = require('../../frontend/public/data/data.json')

router.post('/', (req, res, next) => {
    delete req.body.id;
const book = new Book({
...req.body
});
book.save()
.then(() => res.status(201).json({ message: 'livre enregistré!' }))
.catch(error => res.status(400).json({ error }));

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
})

module.exports = router;