const express = require('express');
const router = express.Router();

router.use('/transcribe', require('./transcribe'))

module.exports = router;