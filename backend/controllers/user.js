// Package npm "bcrypt" : utilise un algorithme unidirectionnel pour chiffrer, créer et utiliser un hash des mots de passe utilisateur.
const bcrypt = require('bcrypt');
// Package npm "json web token" : crée et vérifie des tokens d'authentification.
const jwt = require('jsonwebtoken');

const User = require('../models/user');

/**
 *  Méthode pour créer un compte utilisateur, prête à l'export (cf ../routes/user.js/l.7) :
 *      On appelle la fonction de hachage de bcrypt dans notre mot de passe et lui demandons de « saler » le mot de passe 10 fois ;
 *      Elle renvoie une Promise dans laquelle nous recevons le hash généré ;
 *          Dans notre bloc then , nous créons un utilisateur et l'enregistrons dans la base de données, en renvoyant une réponse de réussite en cas de succès ;
 *          et des erreurs avec le code d'erreur en cas d'échec. 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.signup = (req, res, next) => {    
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
            .then(() => res.status(201).json({ message: 'utilisateur créé !'}))
            .catch(error => res.status(400).json({ message : 'Un compte existe déjà avec cet Email.'}));
        })
        .catch(error => res.status(500).json({ error }))
};

/**
 *  Méthode pour s'identifier, prête à l'export (cf ../routes/user.js/l.8) :
 *      On utilise notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :
 *          Dans le cas contraire, on renvoie une erreur401 Unauthorized ;
 *          Si ça correspond, on continue et on utilise  la fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données :
 *              S'ils ne correspondent pas, on renvoie la même erreur401 Unauthorized ;
 *              S'ils correspondent, on renvoie une réponse 200 contenant l'ID utilisateur et un token :
 *                  On utilise  la fonction .sign de jsonwebtoken pour chiffrer un nouveau token ;
 *                      On y inclue l'id de l'utilisateur ;
 *                      (On a créé au préalable un fichier caché .env avec une clé de chiffrement complexe) :
 *                      On l'appelle grâce à process.env.{NOM_DE_LA_CLÉ} ;
 *                      On donne une durée de vie au token.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé...' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe ou email incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SECRET_KEY,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};