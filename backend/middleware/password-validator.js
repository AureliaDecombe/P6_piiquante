// Package npm "password validator" : permet de valider un mot de passe à partir de spécifications intuitives et flexibles.
var passwordValidator = require('password-validator');

var passwordSchema = new passwordValidator();

// Définition du schéma désiré :
passwordSchema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .digits(1)
    .has().not().spaces()

/**
 * Middleware pour vérifier si un schema de password défini au préalable est respecté :
 * On exporte ensuite l'élément passwordValidator entièrement configuré (cf "checkPassword" > ../routes/user.js/l.5&7).
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        res.status(400).json({
            message: 'Votre mot de passe doit contenir au moins 8 caractères, avec une lettre majuscule , une lettre minuscule et au moins 1 chiffre !'
        });
    } else {
        next();
    }
};