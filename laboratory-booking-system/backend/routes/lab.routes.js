const express = require('express');
const router = express.Router();
const labController = require('../controllers/lab.controller');


// Define routes for lab management
router.get('/', labController.getAllLabs);
router.post('/', labController.createLab);
router.put('/:lab_id', labController.updateLab);
router.delete('/:lab_id', labController.deleteLab);

module.exports = router