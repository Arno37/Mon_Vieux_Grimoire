const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  grade: { type: Number, required: true }
});

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [ratingSchema], // Un tableau d'objets de notation
  averageRating: { type: Number, default: 0 }, // Peut être calculé
  imageUrl: { type: String, required: true },
});

bookSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
      const total = this.ratings.reduce((acc, rating) => acc + rating.grade, 0);
      this.averageRating = total / this.ratings.length;
    } else {
      this.averageRating = 0;
    }
    next();
  });

module.exports = mongoose.model('Book', bookSchema);