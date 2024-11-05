const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

router.get('/teams', adminController.getAllTeams);
router.post('/teams', adminController.createTeam);
router.put('/teams/:teamId', adminController.updateTeam);
router.delete('/teams/:teamId', adminController.deleteTeam);

module.exports = router; 