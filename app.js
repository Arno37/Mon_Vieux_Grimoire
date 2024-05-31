const express = require('express');
const mongoose = require('mongoose');
const stuffRoutes = require('./routes/stuff')



mongoose.connect('mongodb+srv://Arno:Fletcher37@cluster0.5auxlj2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  
const app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();


app.disable('etag')
    })

    app.use('/api/books', stuffRoutes)


module.exports = app;