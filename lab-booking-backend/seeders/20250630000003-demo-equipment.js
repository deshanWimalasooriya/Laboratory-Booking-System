'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get laboratory IDs
    const labs = await queryInterface.sequelize.query(
      "SELECT id, name FROM laboratories LIMIT 3",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get admin user ID
    const [adminUser] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'lecture_in_charge' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!adminUser || labs.length === 0) {
      console.log('No admin user or laboratories found. Skipping equipment seeding.');
      return;
    }

    const equipment = [];

    labs.forEach((lab, index) => {
      // Computer equipment for computer labs
      if (lab.name.includes('Computer')) {
        equipment.push(
          {
            id: uuidv4(),
            name: 'Desktop Computer',
            code: `PC-${String(index + 1).padStart(3, '0')}-001`,
            description: 'High-performance desktop computer for programming',
            category: 'computer',
            brand: 'Dell',
            model: 'OptiPlex 7090',
            serial_number: `DL${Date.now()}${index}01`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Desk ${index + 1}`,
            specifications: JSON.stringify({
              processor: 'Intel Core i7-11700',
              ram: '16GB DDR4',
              storage: '512GB SSD',
              graphics: 'Intel UHD Graphics 750'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Projector',
            code: `PROJ-${String(index + 1).padStart(3, '0')}-001`,
            description: 'High-quality projector for presentations',
            category: 'projector',
            brand: 'Epson',
            model: 'EX3260',
            serial_number: `EP${Date.now()}${index}02`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'good',
            location: `Ceiling ${index + 1}`,
            specifications: JSON.stringify({
              resolution: 'XGA 1024x768',
              brightness: '3300 lumens',
              contrastRatio: '15000:1'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'quarterly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Whiteboard',
            code: `WB-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Interactive whiteboard for teaching',
            category: 'whiteboard',
            brand: 'Smart',
            model: 'Board MX275',
            serial_number: `SM${Date.now()}${index}03`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Front Wall ${index + 1}`,
            specifications: JSON.stringify({
              size: '75 inch',
              touchPoints: '20',
              resolution: '4K UHD'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Network Switch',
            code: `SW-${String(index + 1).padStart(3, '0')}-001`,
            description: '24-port network switch for lab connectivity',
            category: 'computer',
            brand: 'Cisco',
            model: 'Catalyst 2960',
            serial_number: `CS${Date.now()}${index}04`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'good',
            location: `Network Cabinet ${index + 1}`,
            specifications: JSON.stringify({
              ports: '24',
              speed: '1 Gbps',
              type: 'Managed'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'quarterly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          }
        );
      } else if (lab.name.includes('Physics')) {
        equipment.push(
          {
            id: uuidv4(),
            name: 'Oscilloscope',
            code: `OSC-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Digital oscilloscope for signal analysis',
            category: 'measurement',
            brand: 'Tektronix',
            model: 'TBS1052B',
            serial_number: `TX${Date.now()}${index}01`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'good',
            location: `Bench ${index + 1}`,
            specifications: JSON.stringify({
              bandwidth: '50 MHz',
              channels: 2,
              sampleRate: '1 GS/s'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Function Generator',
            code: `FG-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Arbitrary function generator for signal generation',
            category: 'measurement',
            brand: 'Keysight',
            model: '33220A',
            serial_number: `KS${Date.now()}${index}02`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Bench ${index + 1}`,
            specifications: JSON.stringify({
              frequency: '20 MHz',
              waveforms: 'Sine, Square, Ramp, Pulse, Noise',
              amplitude: '10 Vpp'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'quarterly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Digital Multimeter',
            code: `DMM-${String(index + 1).padStart(3, '0')}-001`,
            description: 'High-precision digital multimeter',
            category: 'measurement',
            brand: 'Fluke',
            model: '87V',
            serial_number: `FL${Date.now()}${index}03`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Bench ${index + 1}`,
            specifications: JSON.stringify({
              accuracy: '0.05%',
              display: '4.5 digit',
              functions: 'AC/DC Voltage, Current, Resistance, Frequency'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Power Supply',
            code: `PS-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Variable DC power supply',
            category: 'measurement',
            brand: 'Agilent',
            model: 'E3631A',
            serial_number: `AG${Date.now()}${index}04`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'good',
            location: `Bench ${index + 1}`,
            specifications: JSON.stringify({
              outputs: '3',
              voltage: '0-25V, 0-25V, 0-6V',
              current: '1A, 1A, 5A'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'quarterly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          }
        );
      } else if (lab.name.includes('Chemistry')) {
        equipment.push(
          {
            id: uuidv4(),
            name: 'Fume Hood',
            code: `FH-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Chemical fume hood for safe ventilation',
            category: 'safety',
            brand: 'Labconco',
            model: 'Protector XStream',
            serial_number: `LC${Date.now()}${index}01`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Station ${index + 1}`,
            specifications: JSON.stringify({
              airflow: '100 fpm',
              size: '4 ft',
              sashHeight: '28 inches'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Analytical Balance',
            code: `AB-${String(index + 1).padStart(3, '0')}-001`,
            description: 'High-precision analytical balance',
            category: 'measurement',
            brand: 'Mettler Toledo',
            model: 'XS205',
            serial_number: `MT${Date.now()}${index}02`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Balance Room ${index + 1}`,
            specifications: JSON.stringify({
              capacity: '220g',
              readability: '0.1mg',
              repeatability: '0.1mg'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'pH Meter',
            code: `PH-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Digital pH meter for solution analysis',
            category: 'measurement',
            brand: 'Hanna Instruments',
            model: 'HI-2020',
            serial_number: `HI${Date.now()}${index}03`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'good',
            location: `Bench ${index + 1}`,
            specifications: JSON.stringify({
              range: '-2.00 to 16.00 pH',
              accuracy: '±0.01 pH',
              temperature: '0 to 100°C'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Centrifuge',
            code: `CF-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Laboratory centrifuge for sample separation',
            category: 'other',
            brand: 'Eppendorf',
            model: '5424R',
            serial_number: `EP${Date.now()}${index}04`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Bench ${index + 1}`,
            specifications: JSON.stringify({
              capacity: '24 x 1.5/2.0 mL',
              maxSpeed: '15000 rpm',
              temperature: '4°C to 40°C'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'quarterly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Safety Shower',
            code: `SS-${String(index + 1).padStart(3, '0')}-001`,
            description: 'Emergency safety shower and eyewash station',
            category: 'safety',
            brand: 'Guardian',
            model: 'G1902',
            serial_number: `GD${Date.now()}${index}05`,
            laboratory_id: lab.id,
            status: 'working',
            condition: 'excellent',
            location: `Emergency Station ${index + 1}`,
            specifications: JSON.stringify({
              flowRate: '20 GPM',
              eyewash: 'Included',
              activation: 'Pull handle'
            }),
            maintenance_schedule: JSON.stringify({
              frequency: 'monthly',
              lastMaintenance: null,
              nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }),
            is_active: true,
            created_by: adminUser.id,
            created_at: new Date(),
            updated_at: new Date()
          }
        );
      }

      // Add common furniture for all labs
      equipment.push(
        {
          id: uuidv4(),
          name: 'Lab Table',
          code: `TBL-${String(index + 1).padStart(3, '0')}-001`,
          description: 'Chemical-resistant laboratory table',
          category: 'furniture',
          brand: 'Lab Furniture Inc',
          model: 'LT-2460',
          serial_number: `LF${Date.now()}${index}06`,
          laboratory_id: lab.id,
          status: 'working',
          condition: 'good',
          location: `Center ${index + 1}`,
          specifications: JSON.stringify({
            size: '24" x 60"',
            material: 'Epoxy resin',
            height: '36 inches'
          }),
          maintenance_schedule: JSON.stringify({
            frequency: 'quarterly',
            lastMaintenance: null,
            nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }),
          is_active: true,
          created_by: adminUser.id,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          name: 'Lab Stool',
          code: `STL-${String(index + 1).padStart(3, '0')}-001`,
          description: 'Adjustable laboratory stool',
          category: 'furniture',
          brand: 'Lab Seating Co',
          model: 'LS-300',
          serial_number: `LS${Date.now()}${index}07`,
          laboratory_id: lab.id,
          status: 'working',
          condition: 'good',
          location: `Workstation ${index + 1}`,
          specifications: JSON.stringify({
            height: 'Adjustable 18-26 inches',
            material: 'Vinyl',
            base: '5-star nylon'
          }),
          maintenance_schedule: JSON.stringify({
            frequency: 'quarterly',
            lastMaintenance: null,
            nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }),
          is_active: true,
          created_by: adminUser.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    });

    if (equipment.length > 0) {
      await queryInterface.bulkInsert('equipment', equipment, {});
      console.log(`Seeded ${equipment.length} equipment items`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('equipment', null, {});
  }
};
