// Package npm "jsonwebtoken" : crée et vérifie des tokens d'authentification.
const jwt = require('jsonwebtoken');

/**
 * Middleware qui vérifie que l’utilisateur est bien connecté et qui transmet les infos de connexion aux différentes méthodes qui vont gérer les requêtes (cf "auth" > ../routes/sauces/l.9>14) :
 *  Étant donné les nombreux problèmes qui peuvent se produire, on insère tout à l'intérieur d'un bloc try...catch :
 *      On extrait le token du header Authorization de la requête entrante, 
 *      (.split récupère tout après l'espace dans le header) ;
 *      On utilise ensuite la fonction verify pour décoder notre token ;
 *      On extrait enfin l'ID utilisateur de notre token et on le rajoute à l’objet Request afin que nos différentes routes puissent l’exploiter.
 *  Si tout est OK, on passe à l'exécution à l'aide de la fonction next().
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};