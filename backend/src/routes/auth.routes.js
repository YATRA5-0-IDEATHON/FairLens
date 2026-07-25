const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/company-login', authController.companyLogin);
router.post('/employee-login', authController.employeeLogin);

module.exports = router;
