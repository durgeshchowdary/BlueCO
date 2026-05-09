const express = require('express');
const router = express.Router();
const { createDemoRequest, getDemoRequests } = require('../controllers/demoRequestController');

router.post('/', createDemoRequest);
router.get('/', getDemoRequests);

module.exports = router;