const Book = require('../models/Book');
const fs = require('fs')

exports.createBook = (req, res, next) => {
const bookObject = JSON.parse(req.body.book);
delete bookObject._id
delete bookObject._userId
  const book = new Book({
   ...bookObject,
   userId: req.auth.userId,
   imageUrl: `${req.protocol}://${req.get('host')}/pictures/resized_${req.file.filename}`,
   averageRating: bookObject.ratings[0].grade
    
  });
  book.save()
  .then(() => { res.status(201).json({ message: 'Livre enregistré!' }) })
  .catch(error => { res.status(400).json({ error }) })
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ error }));
    }

    exports.getAllBooks = (req, res, next) => {
      Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
    };
    

    exports.modifyBook = (req, res, next) => {
      const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/pictures/${req.file.filename}`
      } : { ...req.body };
      delete bookObject._userId;
    
      Book.findOne({_id: req.params.id})
        .then((book) => {
          if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
          }
          if (book.userId != req.auth.userId) {
            return res.status(403).json({ message: '403: unauthorized request' });
          }
          
          // Supprimer l'ancienne image si un nouveau fichier a été téléchargé
          if (req.file) {
            const filename = book.imageUrl.split('/pictures/')[1];
            fs.unlink(`pictures/${filename}`, (err) => {
              if (err) console.log(err);
            });
          }
          
          // Mettre à jour le livre dans la base de données
          Book.updateOne({_id: req.params.id}, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié!' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => {
          res.status(500).json({ error: 'Erreur serveur' });
        });
    };

exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
  .then(book => {
    if (book.userId != req.auth.userId) {
      res.status(403).json({ message: '403: unauthorized request' });
    } else {
      const filename = book.imageUrl.split('/pictures/')[1];
      fs.unlink(`pictures/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
        .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
        .catch(error => res.status(400).json({ error }));
      })
    }
})
.catch( error => {
  res.status(404).json({ error });
});
};



  exports.getBestRating = (req, res, next) => {
    Book.find().sort({ averageRating: -1}).limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
  
};