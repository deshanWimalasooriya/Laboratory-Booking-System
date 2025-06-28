const express = require('express');
const router = express.Router();
const labController = require('../controllers/lab.controller');

router.get('/available', labController.getAvailable);
router.get('/bookings', labController.getBookings);
router.get('/', labController.getAllLabs); // This route can be used to get all labs, both available and booked
router.get('/:lab_id', labController.getLabById);
router.post('/', labController.createLabSchedule);
router.put('/:lab_id', labController.updateLabSchedule);
router.delete('/:lab_id', labController.deleteLabSchedule);

module.exports = router