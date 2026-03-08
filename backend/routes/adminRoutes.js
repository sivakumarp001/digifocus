const express = require('express');
const router = express.Router();
const { getAllUsers, getUserDetail, deleteUser, getReports } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReports);

module.exports = router;
