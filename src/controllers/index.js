const express = require('express');
const router = express.Router();

router.use('/contract', require('./contractController'));
router.use('/data', require('./dataController'));
router.use('/search', require('./searchController'));
router.use('/ens', require('./ensController'));
router.use('/address', require('./addressController'));
router.use('/verification', require('./verificationController'));

module.exports = router;
