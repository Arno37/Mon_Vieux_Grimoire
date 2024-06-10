/* eslint-disable import/newline-after-import */
/* eslint-disable prefer-template */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable padded-blocks */
/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable comma-dangle */
/* eslint-disable arrow-parens */
/* eslint-disable import/order */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const uploadPictures = 'pictures';

exports.createBook = (req, res, next) => {
const bookObject = JSON.parse(req.body.book);
delete bookObject._id;
delete bookObject._userId;

if (req.file) {
  const buffer = req.file.buffer;
  const originalname = req.file.originalname.split(' ').join('_');
  const extension = 'webp';
  const fileName = originalname + Date.now() + '.' + extension;

  // Utilisation de Sharp pour convertir et compresser l'image
  sharp(buffer)
      .resize(500)
      .toFormat('webp')
      .webp({ quality: 20 })
      .toBuffer()
      .then(data => {
          fs.writeFileSync(path.join(uploadPictures, fileName), data);


  const book = new Book({
   ...bookObject,
   userId: req.auth.userId,
   imageUrl: `${req.protocol}://${req.get('host')}/${uploadPictures}/${fileName}`  
  });
  book.save()
  .then(() => res.status(201).json({ message: 'Livre enregistré!' }))
  .catch(error => res.status(400).json({ error }));
})
.catch(error => res.status(500).json({ error }));
} else {
    res.status(400).json({ message: 'Image non fournie' });
}
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ error }));
    };

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
          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                .catch(error => res.status(401).json({ error }));
        })
        .catch((error) => {
            res.status(400).json({ error });
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
        .then(() => { res.status(200).json({ message: 'Livre supprimé !' }); })
        .catch(error => res.status(400).json({ error }));
      });
    }
})
.catch(error => {
  res.status(404).json({ error });
});
};

exports.addRating = (req, res, next) => {
const bookID = req.params.id;
const userId = req.body.userId;
const addRating = req.body.rating;

if (addRating < 0 || addRating > 5) {
  return res.status(400).json({ message: 'La note doit être entre 0 et 5.' });
}
Book.findOne({ _id: bookID })
.then(book => {
  if (!book) {
    return res.status(404).json({ message: 'livre non trouvé' });
  }
  if (book.ratings.find(rating => rating.userId === userId)) {
    return res.status(400).json({ error: 'Utilisateur a déjà noté ce livre' });
  }
  book.ratings.push({ userId, grade: addRating });

  book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;
  return book.save();

})
.then(updatedBook => {
  res.status(200).json(updatedBook);
})
.catch(error => res.status(500).json({ error }));
};

exports.getBestRating = (req, res, next) => {
  Book.find().sort({ averageRating: -1}).limit(3)
  .then((books) => res.status(200).json(books))
  .catch((error) => res.status(404).json({ error }));

};
