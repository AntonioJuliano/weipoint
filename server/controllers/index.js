const express = require('express');
const router = express.Router();

router.use('/api/v1/contract', require('./contractController'));
router.use('/api/v1/data', require('./dataController'));
router.use('/api/v1/search', require('./searchController'));

module.exports = router;
