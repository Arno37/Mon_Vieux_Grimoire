const express = require('express');
const mongoose = require('mongoose');
const libraryRoutes = require('./routes/library');
const userRoutes =  require ('./routes/user');



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
});

app.delete ('/api/library/:id', (req, res, next) => {
Book.deleteOne({_id: req.params.id })
.then(() => res.status(200).json({ message: 'livre supprimé'}))
.catch(error => res.status(400).json({ error }));
})


    app.put('/api/library/:id', (req, res, next) => {
      Book.updateOne({_id: req.params.id }, {...req.body, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'livre modifié'}))
      .catch(error => res.status(400));
    });


app.disable('etag')
    

    app.use('/api/library', libraryRoutes);
    app.use('/api/auth', userRoutes);


module.exports = app;