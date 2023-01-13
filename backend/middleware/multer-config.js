// Package npm "multer" :  permet de gérer les fichiers entrants dans les requêtes HTTP.
const multer = require('multer');

// Définition des extensions à corriger :
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

/**
 *  On crée une constante storage , à passer à multer comme configuration :
 *      La fonction destination indique à multer d'enregistrer les fichiers dans le dossier images ;
 *      La fonction filename indique à multer d'utiliser :
 *          Le nom d'origine en remplaçant les espaces par des underscores et en ajoutant un timestamp Date.now() comme nom de fichier ;
 *          Elle utilise ensuite la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée.
 */
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

/**
 *  On exporte ensuite l'élément multer entièrement configuré (cf "multer" > ../routes/sauces.js/l.10&12&14) :
 *      On lui passe notre constante storage et on lui indique qu'il gérera uniquement les téléchargements de fichiers image.
 */
module.exports = multer({storage: storage}).single('image');