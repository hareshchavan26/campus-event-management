import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

/**
 * Helper to compute an ISO date string (YYYY-MM-DD) offset by days from today
 */
const getDateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const seedDatabase = async () => {
  console.log('====================================================');
  console.log(' Starting Campus Event Management Database Seeding... ');
  console.log('====================================================');

  const connection = await pool.getConnection();

  try {
    // Disable foreign key checks for clean wiping and re-seeding
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('[Seed] Clearing existing table data...');
    await connection.query('TRUNCATE TABLE registrations;');
    await connection.query('TRUNCATE TABLE events;');
    await connection.query('TRUNCATE TABLE categories;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 1. Seed Users
    console.log('[Seed] Seeding default users (1 Admin + 3 Students)...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const studentPasswordHash = await bcrypt.hash('Student@123', 10);

    const usersToInsert = [
      ['Campus Administrator', 'admin@campus.edu', adminPasswordHash, 'admin'],
      ['Alex Johnson', 'student1@campus.edu', studentPasswordHash, 'student'],
      ['Maya Patel', 'student2@campus.edu', studentPasswordHash, 'student'],
      ['David Kim', 'student3@campus.edu', studentPasswordHash, 'student']
    ];

    const [adminResult] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ?',
      [usersToInsert]
    );

    const adminId = adminResult.insertId; // First inserted ID is the admin
    console.log(`[Seed] Seeded 4 users successfully. Admin ID: ${adminId}`);

    // Fetch student IDs for later registration seeding
    const [studentRows] = await connection.query(
      'SELECT id, email FROM users WHERE role = "student" ORDER BY id ASC'
    );
    const student1Id = studentRows[0].id;
    const student2Id = studentRows[1].id;
    const student3Id = studentRows[2].id;

    // 2. Seed Categories
    console.log('[Seed] Seeding 5 official event categories...');
    const categories = [
      ['Technical'],
      ['Cultural'],
      ['Sports'],
      ['Workshop'],
      ['Seminar']
    ];

    await connection.query('INSERT INTO categories (name) VALUES ?', [categories]);

    const [catRows] = await connection.query('SELECT id, name FROM categories');
    const catMap = {};
    catRows.forEach(c => { catMap[c.name] = c.id; });
    console.log('[Seed] Seeded categories:', Object.keys(catMap).join(', '));

    // 3. Seed 12 Realistic Future Events
    console.log('[Seed] Seeding 12 future campus events...');
    const eventsData = [
      {
        title: 'Annual Hackathon: HackTheCampus 2026',
        description: 'A 24-hour non-stop campus-wide hackathon focusing on AI innovation, sustainable smart campus tech, and student productivity tools. Mentors from premier tech firms will provide hands-on feedback and prizes include hardware gadgets and internship opportunities.',
        category_id: catMap['Technical'],
        venue: 'Engineering Block - Tech Arena Hall 4',
        event_date: getDateOffset(4),
        event_time: '09:00:00',
        capacity: 100,
        organizer: 'Campus Tech Council & ACM Student Chapter'
      },
      {
        title: 'Spring Harmony: Inter-College Cultural Gala',
        description: 'An evening celebrating campus artistry, acoustic melodies, traditional dances, and beatboxing face-offs. Refreshment counters and photography booths will be stationed across the arena.',
        category_id: catMap['Cultural'],
        venue: 'Grand Central Auditorium',
        event_date: getDateOffset(7),
        event_time: '17:30:00',
        capacity: 250,
        organizer: 'Fine Arts & Cultural Club'
      },
      {
        title: 'Inter-Department Basketball Championship',
        description: 'Fast-paced basketball tournament pitting departments against each other in round-robin and knockout matches. Cheer for your peers and experience electrifying athletic rivalry.',
        category_id: catMap['Sports'],
        venue: 'Campus Indoor Sports Complex - Court 1',
        event_date: getDateOffset(9),
        event_time: '16:00:00',
        capacity: 80,
        organizer: 'Department of Physical Education'
      },
      {
        title: 'Hands-on Cloud & Kubernetes Workshop',
        description: 'Master containerization fundamentals, Docker compose orchestration, and zero-downtime deployment pipelines on modern cloud infrastructure. Bring your laptop with Docker Desktop pre-installed.',
        category_id: catMap['Workshop'],
        venue: 'Computer Science Lab 3, 2nd Floor',
        event_date: getDateOffset(11),
        event_time: '10:00:00',
        capacity: 35,
        organizer: 'Cloud DevOps Community'
      },
      {
        title: 'Navigating Tech Careers: Industry Leader Seminar',
        description: 'Distinguished campus alumni and engineering leaders talk candidly about surviving tech hiring waves, open-source portfolio building, and cracking full-stack software development interviews.',
        category_id: catMap['Seminar'],
        venue: 'Auditorium Hall B - Management Block',
        event_date: getDateOffset(14),
        event_time: '14:00:00',
        capacity: 120,
        organizer: 'Training & Career Placement Cell'
      },
      {
        title: 'Robotics & Embedded IoT Showcase',
        description: 'Explore live autonomous rover demonstrations, drone obstacle flights, and ESP32 smart home automations built entirely by student makers and robotics enthusiasts.',
        category_id: catMap['Technical'],
        venue: 'Makerspace Lab & Robotics Arena',
        event_date: getDateOffset(18),
        event_time: '11:00:00',
        capacity: 60,
        organizer: 'Robotics & Automation Society'
      },
      {
        title: 'Campus Open Mic & Standup Comedy Night',
        description: 'Unwind before midterm assessments with punchlines, satirical campus sketches, storytelling, and musical poetry from talented campus wits.',
        category_id: catMap['Cultural'],
        venue: 'Student Amphitheatre (Open Air Stage)',
        event_date: getDateOffset(21),
        event_time: '18:30:00',
        capacity: 150,
        organizer: 'Literary & Dramatic Arts Club'
      },
      {
        title: 'Annual Campus Marathon: Run for Clean Energy',
        description: '5K and 10K running circuits around the campus perimeter promoting environmental consciousness. Free race bibs, hydration packs, and commemorative medals for all finishers.',
        category_id: catMap['Sports'],
        venue: 'Main University Gate (Start & Finish Line)',
        event_date: getDateOffset(24),
        event_time: '06:30:00',
        capacity: 300,
        organizer: 'Eco Club & Sports Committee'
      },
      {
        title: 'Full-Stack UI/UX Design Sprint with Figma',
        description: 'Deep dive into responsive layout grids, interactive wireframes, component design tokens, and usability testing methodologies. Design an end-to-end mobile web product from scratch.',
        category_id: catMap['Workshop'],
        venue: 'Media Design Lab, Humanities Wing',
        event_date: getDateOffset(28),
        event_time: '13:00:00',
        capacity: 40,
        organizer: 'Creative Design Guild'
      },
      {
        title: 'Cybersecurity Threat Intelligence Seminar',
        description: 'A deep-dive technical lecture dissecting state-sponsored cyber breaches, penetration testing methodologies, zero-trust network architectures, and digital forensics.',
        category_id: catMap['Seminar'],
        venue: 'Science Block Conference Room A',
        event_date: getDateOffset(32),
        event_time: '15:00:00',
        capacity: 90,
        organizer: 'Cyber Security Club'
      },
      {
        title: 'Web3 & Decentralized Systems Symposium',
        description: 'Explore smart contract audits, decentralized storage networks, and consensus protocols with visiting blockchain architects and researchers.',
        category_id: catMap['Technical'],
        venue: 'Seminar Hall 2 - CS Wing',
        event_date: getDateOffset(36),
        event_time: '10:30:00',
        capacity: 75,
        organizer: 'Distributed Systems Study Group'
      },
      {
        title: 'Campus Badminton Singles & Doubles Derby',
        description: 'High-intensity racquet tournament featuring men\'s and women\'s singles and mixed doubles. Feather shuttles provided. Trophies and certificates for podium winners.',
        category_id: catMap['Sports'],
        venue: 'Student Activity Center - Badminton Courts',
        event_date: getDateOffset(40),
        event_time: '16:30:00',
        capacity: 50,
        organizer: 'Badminton Association'
      }
    ];

    for (let i = 0; i < eventsData.length; i++) {
      const e = eventsData[i];
      const [eventInsert] = await connection.query(`
        INSERT INTO events (title, description, category_id, venue, event_date, event_time, capacity, image_url, organizer, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        e.title,
        e.description,
        e.category_id,
        e.venue,
        e.event_date,
        e.event_time,
        e.capacity,
        `https://picsum.photos/seed/event-${i + 1}/600/400`,
        e.organizer,
        adminId
      ]);
      e.id = eventInsert.insertId;
    }
    console.log(`[Seed] Seeded ${eventsData.length} events successfully.`);

    // 4. Seed initial registrations for realistic data
    console.log('[Seed] Seeding sample student registrations...');
    const [allEvents] = await connection.query('SELECT id, title FROM events ORDER BY id ASC LIMIT 5');

    // Register student1 for event 1 and event 2
    // Register student2 for event 1 and event 3
    // Register student3 for event 2 and event 4
    const registrationsToInsert = [
      [student1Id, allEvents[0].id],
      [student1Id, allEvents[1].id],
      [student2Id, allEvents[0].id],
      [student2Id, allEvents[2].id],
      [student3Id, allEvents[1].id],
      [student3Id, allEvents[3].id]
    ];

    await connection.query('INSERT INTO registrations (user_id, event_id) VALUES ?', [registrationsToInsert]);
    console.log('[Seed] Seeded sample student registrations.');

    console.log('====================================================');
    console.log(' Database Seeding Finished Successfully!            ');
    console.log('====================================================');
    console.log('Credentials:');
    console.log('  Admin:   admin@campus.edu   / Admin@123');
    console.log('  Student: student1@campus.edu / Student@123');
    console.log('  Student: student2@campus.edu / Student@123');
    console.log('  Student: student3@campus.edu / Student@123');
    console.log('====================================================');
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
};

seedDatabase();
