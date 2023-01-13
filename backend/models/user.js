// Package npm "mongoose" : facilite les interactions avec notre base de données MongoDB.
const mongoose = require('mongoose');
// Package npm "mongoose-unique-validator" : package de validation pour prévalider les informations avant de les enregistrer.
const uniqueValidator = require('mongoose-unique-validator');
// Package npm "mongoose-mongodb-errors" : pour transformer les erreurs de type mongodb en instances de Mongoose ValidationError.
const mongodbErrorHandler = require('mongoose-mongodb-errors');

// Définition de notre modèle d'utilisateur :
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);