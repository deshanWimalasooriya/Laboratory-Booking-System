'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get laboratory IDs
    const labs = await queryInterface.sequelize.query(
      "SELECT id, name FROM laboratories LIMIT 3",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get instructor user ID
    const [instructor] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'instructor' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get admin user ID for created_by
    const [adminUser] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'lecture_in_charge' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!adminUser || labs.length === 0) {
      console.log('No admin user or laboratories found. Skipping schedule seeding.');
      return;
    }

    const schedules = [];
    const currentDate = new Date();
    const semesterStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const semesterEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 4, 0);

    labs.forEach((lab, index) => {
      if (lab.name.includes('Computer')) {
        // Computer Science schedules
        schedules.push(
          {
            id: uuidv4(),
            title: 'Programming Fundamentals',
            description: 'Introduction to programming concepts using Python',
            laboratory_id: lab.id,
            instructor_id: instructor?.id || null,
            course_code: 'CS101',
            course_name: 'Programming Fundamentals',
            semester: 'Fall 2024',
            academic_year: '2024-2025',
            day_of_week: 'monday',
            start_time: '09:00:00',
            end_time: '11:00:00',
            start_date: semesterStart,
            end_date: semesterEnd,
            max_students: 30,
            schedule_type: 'regular',
            is_active: true,
            notes: 'Bring your laptops for hands-on coding exercises',
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            title: 'Data Structures Lab',
            description: 'Practical implementation of data structures',
            laboratory_id: lab.id,
            instructor_id: instructor?.id || null,
            course_code: 'CS201',
            course_name: 'Data Structures and Algorithms',
            semester: 'Fall 2024',
            academic_year: '2024-2025',
            day_of_week: 'wednesday',
            start_time: '14:00:00',
            end_time: '16:00:00',
            start_date: semesterStart,
            end_date: semesterEnd,
            max_students: 25,
            schedule_type: 'regular',
            is_active: true,
            notes: 'Prerequisites: CS101 or equivalent',
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            title: 'Web Development Workshop',
            description: 'Hands-on web development using modern frameworks',
            laboratory_id: lab.id,
            instructor_id: instructor?.id || null,
            course_code: 'CS301',
            course_name: 'Web Technologies',
            semester: 'Fall 2024',
            academic_year: '2024-2025',
            day_of_week: 'friday',
            start_time: '10:00:00',
            end_time: '12:00:00',
            start_date: semesterStart,
            end_date: semesterEnd,
            max_students: 20,
            schedule_type: 'regular',
            is_active: true,
            notes: 'HTML, CSS, JavaScript, and React framework',
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          }
        );
      } else if (lab.name.includes('Physics')) {
        // Physics schedules
        schedules.push(
          {
            id: uuidv4(),
            title: 'Circuit Analysis Lab',
            description: 'Hands-on circuit analysis and measurements',
            laboratory_id: lab.id,
            instructor_id: instructor?.id || null,
            course_code: 'PHY201',
            course_name: 'Electrical Circuits',
            semester: 'Fall 2024',
            academic_year: '2024-2025',
            day_of_week: 'tuesday',
            start_time: '09:00:00',
            end_time: '12:00:00',
            start_date: semesterStart,
            end_date: semesterEnd,
            max_students: 20,
            schedule_type: 'regular',
            is_active: true,
            notes: 'Safety briefing required before first lab session',
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            title: 'Electronics Practical',
            description: 'Digital and analog electronics experiments',
            laboratory_id: lab.id,
            instructor_id: instructor?.id || null,
            course_code: 'PHY301',
            course_name: 'Electronics',
            semester: 'Fall 2024',
            academic_year: '2024-2025',
            day_of_week: 'thursday',
            start_time: '14:00:00',
            end_time: '17:00:00',
            start_date: semesterStart,
            end_date: semesterEnd,
            max_students: 18,
            schedule_type: 'regular',
            is_active: true,
            notes: 'Lab reports due one week after each session',
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          }
        );
      } else if (lab.name.includes('Chemistry')) {
        // Chemistry schedules
        schedules.push(
          {
            id: uuidv4(),
            title: 'Organic Chemistry Lab',
            description: 'Synthesis and analysis of organic compounds',
            laboratory_id: lab.id,
            instructor_id: instructor?.id || null,
            course_code: 'CHEM201',
            course_name: 'Organic Chemistry',
            semester: 'Fall 2024',
            academic_year: '2024-2025',
            day_of_week: 'monday',
            start_time: '13:00:00',
            end_time: '16:00:00',
            start_date: semesterStart,
            end_date: semesterEnd,
            max_students: 16,
            schedule_type: 'regular',
            is_active: true,
            notes: 'Safety goggles and lab coats mandatory',
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            title: 'Analytical Chemistry',
            description: 'Quantitative analysis techniques and instrumentation',
            laboratory_id: lab.id,
            instructor_id: instructor?.id || null,
            course_code: 'CHEM301',
            course_name: 'Analytical Chemistry',
            semester: 'Fall 2024',
            academic_year: '2024-2025',
            day_of_week: 'wednesday',
            start_time: '09:00:00',
            end_time: '12:00:00',
            start_date: semesterStart,
            end_date: semesterEnd,
            max_students: 15,
            schedule_type: 'regular',
            is_active: true,
            notes: 'Advanced instrumentation training included',
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          }
        );
      }
    });

    if (schedules.length > 0) {
      await queryInterface.bulkInsert('schedules', schedules, {});
      console.log(`Seeded ${schedules.length} schedules`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('schedules', null, {});
  }
};
