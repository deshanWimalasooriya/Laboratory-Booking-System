'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user ID for created_by field
    const [adminUser] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'lecture_in_charge' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('laboratories', [
      {
        id: uuidv4(),
        name: 'Computer Science Lab 1',
        code: 'CS-LAB-001',
        description: 'Main computer laboratory with 30 workstations for programming and software development courses.',
        capacity: 30,
        location: 'Building A, Floor 2, Room 201',
        building: 'Building A',
        floor: '2',
        room_number: '201',
        lab_type: 'computer',
        facilities: JSON.stringify([
          'High-speed Internet',
          'Projector',
          'Whiteboard',
          'Air Conditioning',
          'Power Outlets'
        ]),
        safety_requirements: JSON.stringify([
          'No food or drinks',
          'Proper cable management',
          'Emergency exits clearly marked'
        ]),
        operating_hours: JSON.stringify({
          monday: { start: '08:00', end: '18:00', closed: false },
          tuesday: { start: '08:00', end: '18:00', closed: false },
          wednesday: { start: '08:00', end: '18:00', closed: false },
          thursday: { start: '08:00', end: '18:00', closed: false },
          friday: { start: '08:00', end: '17:00', closed: false },
          saturday: { start: '09:00', end: '13:00', closed: false },
          sunday: { start: '09:00', end: '13:00', closed: true }
        }),
        booking_rules: JSON.stringify({
          maxBookingDuration: 180,
          minAdvanceBooking: 30,
          maxAdvanceBooking: 2160,
          allowRecurring: true,
          requireApproval: true
        }),
        is_active: true,
        maintenance_mode: false,
        created_by: adminUser.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Physics Laboratory',
        code: 'PHY-LAB-001',
        description: 'Well-equipped physics laboratory for experiments and practical sessions.',
        capacity: 25,
        location: 'Building B, Floor 1, Room 105',
        building: 'Building B',
        floor: '1',
        room_number: '105',
        lab_type: 'physics',
        facilities: JSON.stringify([
          'Experiment Tables',
          'Fume Hood',
          'Safety Equipment',
          'Measuring Instruments',
          'Storage Cabinets'
        ]),
        safety_requirements: JSON.stringify([
          'Safety goggles required',
          'Lab coats mandatory',
          'No unauthorized experiments',
          'Emergency shower available'
        ]),
        operating_hours: JSON.stringify({
          monday: { start: '09:00', end: '17:00', closed: false },
          tuesday: { start: '09:00', end: '17:00', closed: false },
          wednesday: { start: '09:00', end: '17:00', closed: false },
          thursday: { start: '09:00', end: '17:00', closed: false },
          friday: { start: '09:00', end: '16:00', closed: false },
          saturday: { start: '10:00', end: '14:00', closed: false },
          sunday: { start: '10:00', end: '14:00', closed: true }
        }),
        booking_rules: JSON.stringify({
          maxBookingDuration: 240,
          minAdvanceBooking: 60,
          maxAdvanceBooking: 4320,
          allowRecurring: true,
          requireApproval: true
        }),
        is_active: true,
        maintenance_mode: false,
        created_by: adminUser.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Chemistry Laboratory',
        code: 'CHEM-LAB-001',
        description: 'Advanced chemistry laboratory with modern equipment for organic and inorganic chemistry.',
        capacity: 20,
        location: 'Building C, Floor 3, Room 301',
        building: 'Building C',
        floor: '3',
        room_number: '301',
        lab_type: 'chemistry',
        facilities: JSON.stringify([
          'Fume Hoods',
          'Chemical Storage',
          'Emergency Shower',
          'Eye Wash Stations',
          'Fire Extinguishers',
          'Analytical Balances'
        ]),
        safety_requirements: JSON.stringify([
          'Safety goggles mandatory',
          'Lab coats required',
          'Closed-toe shoes only',
          'No eating or drinking',
          'Proper chemical disposal',
          'Emergency procedures training required'
        ]),
        operating_hours: JSON.stringify({
          monday: { start: '08:30', end: '17:30', closed: false },
          tuesday: { start: '08:30', end: '17:30', closed: false },
          wednesday: { start: '08:30', end: '17:30', closed: false },
          thursday: { start: '08:30', end: '17:30', closed: false },
          friday: { start: '08:30', end: '16:30', closed: false },
          saturday: { start: '09:00', end: '13:00', closed: false },
          sunday: { start: '09:00', end: '13:00', closed: true }
        }),
        booking_rules: JSON.stringify({
          maxBookingDuration: 300,
          minAdvanceBooking: 120,
          maxAdvanceBooking: 4320,
          allowRecurring: true,
          requireApproval: true
        }),
        is_active: true,
        maintenance_mode: false,
        created_by: adminUser.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('laboratories', null, {});
  }
};
