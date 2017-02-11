/**
 * Created by antonio on 1/16/17.
 */
const express = require('express');
const router = express.Router();

router.use('/api/v1/contract', require('./contractController'));

module.exports = router;
