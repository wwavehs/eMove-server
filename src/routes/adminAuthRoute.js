const express = require('express');
const router = express.Router();

const { loginAdmin } = require('../controller/adminAuthController');

router.post('/login', loginAdmin);

module.exports = router;
