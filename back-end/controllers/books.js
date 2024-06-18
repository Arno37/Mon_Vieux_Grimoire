/* eslint-disable spaced-comment */
/* eslint-disable object-shorthand */
/* eslint-disable no-shadow */
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
const { error } = require('console');
const uploadPictures = 'pictures';

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  //suppriment _id et _userId du livre, garantissant que ces champs ne sont pas modifiés par l'utilisateur//

  if (req.file) {
    const buffer = req.file.buffer;
    const originalname = req.file.originalname.split(' ').join('_');
    const extension = 'webp';
    const fileName = originalname + Date.now() + '.' + extension;

    sharp(buffer)
      .resize(500)
      .toFormat('webp')
      .webp({ quality: 20 })
      .toBuffer()
      .then(data => {
        fs.writeFileSync(path.join(uploadPictures, fileName), data);
        //Utilisation de sharp pour redimensionner et convertir l'image téléchargée en format webp avec une qualité réduite//

        const book = new Book({
          ...bookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get('host')}/${uploadPictures}/${fileName}`
        });
        if (book.userId != req.auth.userId) {
          return res.status(403).json({ message: '403: unauthorized request' });
        }

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
  try {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/pictures/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (!book) {
          return res.status(404).json({ message: 'Livre non trouvé' });
        }

        if (book.userId != req.auth.userId) {
          return res.status(403).json({ message: '403: unauthorized request' });
        }

        const updateOperations = {
          ...bookObject,
          _id: req.params.id
        };

        if (req.file) {
          const buffer = req.file.buffer;
          const originalname = req.file.originalname.split(' ').join('_');
          const extension = 'webp';
          const fileName = originalname + Date.now() + '.' + extension;

          sharp(buffer)
            .resize(500)
            .toFormat('webp')
            .webp({ quality: 20 })
            .toBuffer()
            .then(data => {
              fs.writeFileSync(path.join(uploadPictures, fileName), data);

              updateOperations.imageUrl = `${req.protocol}://${req.get('host')}/${uploadPictures}/${fileName}`;

              // Suppression de l'ancienne image
              const oldFilename = book.imageUrl.split('/pictures/')[1];
              fs.unlink(`pictures/${oldFilename}`, (err) => {
                if (err) {
                  console.log("Erreur lors de la suppression de l'ancienne image :", err);
                }
              });

              // Mettre à jour le livre avec la nouvelle image
              Book.updateOne({ _id: req.params.id }, updateOperations)
                .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
        } else {
          // Si aucune nouvelle image n'est fournie, mettre à jour simplement les données du livre
          Book.updateOne({ _id: req.params.id }, updateOperations)
            .then(() => res.status(200).json({ message: 'Livre modifié!' }))
            .catch(error => res.status(400).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } catch (error) {
    res.status(400).json({ error: 'Erreur inattendue' });
  }
};


exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
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

exports.addRating = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.body.userId;
  const addRating = req.body.rating;

  if (addRating < 1 || addRating > 5) {
    return res.status(400).json({ error: 'La note doit être entre 1 et 5.' });
  }

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Livre non trouvé." });
    }

    if (book.ratings.some((rating) => rating.userId === userId)) {
      return res.status(400).json({ error: "L'utilisateur a déjà noté ce livre." });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        $push: { ratings: { userId: userId, grade: addRating } },
      },
      { new: true }
      //Utilisation de findByIdAndUpdate de Mongoose pour ajouter une nouvelle note à un livre spécifique. Cela utilise l'opérateur $push pour ajouter une nouvelle note dans le tableau ratings du livre et renvoie le livre mis à jour (new: true).//
    );

    const totalRatings = updatedBook.ratings.length;
    const totalRatingSum = updatedBook.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    );

    updatedBook.averageRating = (totalRatingSum / totalRatings).toFixed(0);

    await updatedBook.save();
    return res.json(updatedBook);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.getBestRating = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};