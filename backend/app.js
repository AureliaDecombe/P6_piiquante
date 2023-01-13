// Package npm "express" : Permet de déployer une API très rapidement (gestion de routes, bodyparsing, ...).
const express = require('express');
// Package npm "mongoose" : facilite les interactions avec notre base de données MongoDB.
const mongoose = require('mongoose');
// Package npm "helmet" : aide à sécuriser une application 'express' en y incluant différents headers.
const helmet = require('helmet');

require('dotenv').config();

const apiLimiter = require('./middleware/rateLimit')
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const path = require('path');

// Connection à MongoDB :
mongoose.connect(process.env.MONGOOSE_URL)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// Règle les erreurs de CORS (Cross Origin Resource Sharing) :
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use(helmet.xssFilter());

app.use('/api', apiLimiter);
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;