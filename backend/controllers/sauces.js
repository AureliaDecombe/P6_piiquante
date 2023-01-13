// Package npm "fs" : donne accès aux fonctions qui nous permettent de modifier le système de fichiers (file system).
const fs = require('fs');

const Sauce = require('../models/sauces');

/**
 *  Méthode pour créer une sauce, prète pour l'export (cf ../routes/sauces.js/l.10) :
 *      On récupère les données du front-end en utilisant JSON.parse pour obtenir un objet utilisable (et non un form-data) ;
 *      On supprime les "faux" id envoyés par le front-end pour les remplacer par les id extraits du token par notre middleware d’authentification ;
 *      On crée une instance de notre modèle Sauce avec les infos requises par le modèle :
 *          l'opérateur spread est utilisé pour faire une copie de tous les éléments de req.body;
 *          on résoud l'URL complète de notre image :
 *              on utilise req.protocol pour obtenir le premier segment,
 *              on ajoute '://', puis utilisons req.get('host') pour résoudre l'hôte du serveur,
 *              on ajoute finalement '/images/' et le nom de fichier pour compléter notre URL;
 *          on établit ensuite les données spécifiques requises :
 *              définition des likes/dislikes à 0,
 *              création de tableaux pour compter et enregistrer les futurs likes/dislikes;
 *      On passe ensuite la méthode save qui envoie une Promise :
 *          dans notre bloc then() , on renvoie une réponse de réussite avec un code 201;
 *          dans notre bloc catch() , nous renverrons une réponse avec l'erreur générée par Mongoose ainsi qu'un code d'erreur 400.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });

    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(500).json( { error })})
};

/**
 *  Méthode pour trouver une sauce, prète pour l'export (cf ../routes/sauces.js/l.11) :
 *      On utilise la méthode findOne() dans notre modèle Sauces pour trouver la Sauce unique ayant le même _id que le paramètre de la requête ;
 *          la réponse est ensuite retournée dans une Promise et envoyé au front-end ;
 *          si aucune correspondance n'est trouvée ou si une erreur se produit, nous envoyons une erreur 404 au front-end, avec l'erreur générée.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            res.status(200).json(sauce);})
        .catch((error) => {
            res.status(500).json({ error });
        });
};

/**
 *  Méthode pour modifier une sauce, prète pour l'export (cf ../routes/sauces.js/l.12) :
 *      Tout d'abord, on crée un objet sauceObject qui regarde si req.file existe ou non : *          
 *          s'il n'existe pas, on traite simplement l'objet entrant ;
 *          s'il existe, on récupère l'image ;
 *      Ensuite, comme pour la méthode create, on supprime le champ _userId envoyé par le client afin d’éviter de changer son propriétaire ;
 *      Puis on utilise l'ID reçue comme paramètre pour accéder à la sauce correspondante dans la base de données :
 *          d'abord, on vérife que le requérant est bien le propriétaire de l’objet ;
 *          puis on supprime si besoin l'ancienne image (fs.unlink);
 *              On crée enfin une instance Sauce à partir de sauceObject, on enregistre la modification et on envoie la réponse au front-end.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message : 'Not authorized'});
            } else {
                if (req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                            .then(() => res.status(200).json({message : 'Objet modifié!'}))
                            .catch(error => res.status(500).json({ error }))
                    });
                } else {
                    Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                        .then(() => res.status(200).json({message : 'Objet modifié!'}))
                        .catch(error => res.status(500).json({ error }));
                }           
            }})
        .catch((error) => {
            res.status(500).json({ error });
        });
};

/**
 *  Méthode pour supprimer une sauce, prète pour l'export (cf ../routes/sauces.js/l.13) :
 *      On utilise l'ID reçue comme paramètre pour accéder à la sauce correspondante dans la base de données ;
 *          D'abord, on vérife que le requérant est bien le propriétaire de l’objet ;
 *          Puis on supprime l'image (fs.unlink);
 *              Dans le callback exécuté ensuite, on implémente la logique d'origine en supprimant la Sauce de la base de données et on envoie la réponse au front-end.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(500).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

/**
 *  Méthode pour trouver toutes les sauces, prète pour l'export (cf ../routes/sauces.js/l.9) :
 *      On utilise la méthode find() dans notre modèle Mongoose afin de renvoyer un tableau contenant tous les Sauces de notre base de données ;
 *          la réponse est ensuite retournée dans une Promise et envoyé au front-end ;
 *          si aucune correspondance n'est trouvée ou si une erreur se produit, nous envoyons une erreur 404 au front-end, avec l'erreur générée.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);})
        .catch((error) => {
            res.status(500).json({ error });
        });
};

/**
 *  Méthode pour juger une sauce existante, prête pour l'export (cf ../routes/sauces.js/l.14) :
 *      On récupère les données nécessaires à partir du frontend (écoute de la zone de likes/dislikes, l'id de l'utilisateur et l'id de la sauce) ;
 *      Si l'utilisateur clique en premier sur "like" :
 *          On récupère le nombre de likes initial de la sauce puis on lui en ajoute un ;
 *      Si l'utilisateur clique en premier sur "dislike" :
 *          On récupère  le nombre de dislikes initial de la sauce puis on lui en ajoute un ;
 *      Si l'utilisateur clique à nouveau sur le même champ (like ou dislike, selon le premier choix) :
 *          L'appréciation est modifiée et revient à son score initial.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.judgeSauce = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;
    if(like === 1){
        Sauce.updateOne({ _id: sauceId } ,{ $inc: { likes: 1 }, $push: { usersLiked: userId }})
            .then(() => res.status(200).json({ message: 'Like ajouté !' }))
            .catch(error => res.status(500).json({ error }));
    }else if(like === -1){
        Sauce.updateOne({ _id: sauceId } ,{ $inc: { dislikes: 1 }, $push: { usersDisliked: userId }})
            .then(() => res.status(200).json({ message: 'Dislike ajouté !' }))
            .catch(error => res.status(500).json({ error }));
    }else{
        Sauce.findOne({ _id: sauceId })
            .then(sauce => {
                if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
                        .then(() => { res.status(200).json({ message: 'Like supprimé !' }) })
                        .catch(error => res.status(500).json({ error }))
                } else if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
                        .then(() => { res.status(200).json({ message: 'Dislike supprimé !' }) })
                        .catch(error => res.status(500).json({ error }))
                }
            })
            .catch(error => res.status(500).json({ error }))
    }
};