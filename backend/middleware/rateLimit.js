// Package npm "express-rate-limit" : Limite les requêtes faîtes à l'API.
const rateLimit = require('express-rate-limit')

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
    message: "Tu ne peux pas réessayer pour l'instant, recommence plus tard !"
})

module.exports = apiLimiter;