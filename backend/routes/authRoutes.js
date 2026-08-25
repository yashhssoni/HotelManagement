const express = require('express');
const router = express.Router();
const {
  registerOwner,
  registerCustomer,
  login,
} = require('../controllers/authController');

router.post('/register-owner', registerOwner);
router.post('/register-customer', registerCustomer);
router.post('/login', login);

module.exports = router;