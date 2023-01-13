// Package npm "mongoose" : facilite les interactions avec notre base de données MongoDB.
const mongoose = require('mongoose');
// Package npm "mongoose-mongodb-errors" : pour transformer les erreurs de type mongodb en instances de Mongoose ValidationError.
const mongodbErrorHandler = require('mongoose-mongodb-errors');

// Définition de notre modèle de sauce :
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true},
    name: { type: String, required: true},
    manufacturer: { type: String, required: true},
    description: { type: String, required: true},
    mainPepper: { type: String, required: true},
    imageUrl: { type: String, required: true},
    heat: { type: Number, required: true},
    likes: { type: Number, required: true},
    dislikes: { type: Number, required: true},
    usersLiked: { type: [String], required: true},
    usersDisliked: { type: [String], required: true},
});

sauceSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Sauces', sauceSchema);