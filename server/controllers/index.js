'use strict';

const express = require('express');
const router = express.Router();

router.use('/api/v1/contract', require('./contractController'));

module.exports = router;
