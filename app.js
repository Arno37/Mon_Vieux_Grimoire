const express = require('express');
const mongoose = require('mongoose');
const books = require('../frontend/public/data/data.json')
const booksRoutes = require('./routes/books');
const userRoutes =  require ('./routes/user');
const path = require('path');

  
const app = express();
app.use(express.json())

mongoose.connect('mongodb+srv://Arno:Fletcher37@cluster0.5auxlj2.mongodb.net/monvieuxgrimoire?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

    app.use('/api/books', booksRoutes);
    app.use('/api/auth', userRoutes);
    app.use('/pictures', express.static(path.join(__dirname, 'pictures')));


module.exports = app;