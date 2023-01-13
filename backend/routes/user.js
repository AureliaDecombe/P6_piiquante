// Package npm "express" : Permet de déployer une API très rapidement (gestion de routes, bodyparsing, ...).
const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const checkPassword = require('../middleware/password-validator');

router.post('/signup', checkPassword, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;