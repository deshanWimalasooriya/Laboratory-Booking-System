'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('Password123!', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@labbook.com',
        password: passwordHash,
        role: 'lecture_in_charge',
        department: 'Computer Science',
        employee_id: 'EMP001',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        first_name: 'Technical',
        last_name: 'Officer',
        email: 'tech@labbook.com',
        password: passwordHash,
        role: 'technical_officer',
        department: 'IT Services',
        employee_id: 'EMP002',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        first_name: 'Dr. John',
        last_name: 'Smith',
        email: 'instructor@labbook.com',
        password: passwordHash,
        role: 'instructor',
        department: 'Computer Science',
        employee_id: 'EMP003',
        phone: '+1234567890',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'student@labbook.com',
        password: passwordHash,
        role: 'student',
        department: 'Computer Science',
        student_id: 'STU001',
        phone: '+1234567891',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@labbook.com',
        password: passwordHash,
        role: 'student',
        department: 'Computer Science',
        student_id: 'STU002',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
