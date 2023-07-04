const express = require('express');
const router = express.Router();
const speechtotextController = require('../controllers/speechtotextController')

router.post('/converttotext', speechtotextController.convertToText)

module.exports = router;