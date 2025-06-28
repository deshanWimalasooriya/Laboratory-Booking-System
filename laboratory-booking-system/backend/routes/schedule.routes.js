const express = require('express');
const router = express.Router();
const labScheduleController = require('../controllers/schedule.controller');

// Define routes for lab schedules
router.get('/available', labScheduleController.getAvailable);
router.get('/bookings', labScheduleController.getBookings);
router.get('/', labScheduleController.getAllLabsSchedules); // This route can be used to get all labs, both available and booked
router.get('/:lab_id', labScheduleController.getLabById);
router.post('/', labScheduleController.createLabSchedule);
router.put('/:lab_id', labScheduleController.updateLabSchedule);
router.delete('/:lab_id', labScheduleController.deleteLabSchedule);

module.exports = router;