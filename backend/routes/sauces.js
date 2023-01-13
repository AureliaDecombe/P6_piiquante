// Package npm "express" : Permet de déployer une API très rapidement (gestion de routes, bodyparsing, ...).
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer =require('../middleware/multer-config')

const saucesCtrl = require('../controllers/sauces');

router.get('/', auth, saucesCtrl.getAllSauces);
router.post('/', auth, multer, saucesCtrl.createSauce);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.post('/:id/like', auth, multer, saucesCtrl.judgeSauce);

module.exports = router;