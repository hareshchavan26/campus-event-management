/**
 * Automated Test Suite for Campus Event Management System Backend API
 * Validates all endpoints, HTTP status codes, security roles, and business rules.
 */

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  FAIL: ${testName} ${details}`);
      failed++;
    }
  };

  console.log('\n======================================================');
  console.log(' Running Backend API Test Suite ');
  console.log('======================================================\n');

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'OK', '1. GET /api/health returns 200 OK');

    // 2. Auth: Invalid Login
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'WrongPassword' })
    });
    assert(badLoginRes.status === 401, '2. POST /api/auth/login with invalid password returns 401');

    // 3. Auth: Valid Student Login
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student1@campus.edu', password: 'Student@123' })
    });
    const studentAuth = await studentLoginRes.json();
    assert(studentLoginRes.status === 200 && studentAuth.token && studentAuth.user.role === 'student', '3. POST /api/auth/login as student returns 200 and token');
    const studentToken = studentAuth.token;

    // 4. Auth: Valid Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'Admin@123' })
    });
    const adminAuth = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminAuth.token && adminAuth.user.role === 'admin', '4. POST /api/auth/login as admin returns 200 and token');
    const adminToken = adminAuth.token;

    // 5. Auth: GET /api/auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === 'student1@campus.edu', '5. GET /api/auth/me returns current user info');

    // 6. Auth: GET /api/auth/me without token
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    assert(noTokenRes.status === 401, '6. GET /api/auth/me without token returns 401');

    // 7. Categories: GET /api/categories
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    assert(catRes.status === 200 && catData.categories.length === 5, '7. GET /api/categories returns 5 seeded categories');
    const technicalCatId = catData.categories.find(c => c.name === 'Technical')?.id;

    // 8. Events: GET /api/events
    const eventsRes = await fetch(`${BASE_URL}/events`);
    const eventsData = await eventsRes.json();
    assert(eventsRes.status === 200 && eventsData.events.length >= 12, '8. GET /api/events returns event list');
    const firstEvent = eventsData.events[0];
    assert(firstEvent && typeof firstEvent.seats_left === 'number', '   - Event contains computed seats_left');

    // 9. Events: Search
    const searchRes = await fetch(`${BASE_URL}/events?search=Hackathon`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.events.length >= 1, '9. GET /api/events?search=Hackathon returns matching event');

    // 10. Events: Filter by Category
    const filterRes = await fetch(`${BASE_URL}/events?category=Workshop`);
    const filterData = await filterRes.json();
    assert(filterRes.status === 200 && filterData.events.length >= 2, '10. GET /api/events?category=Workshop filters properly');

    // 11. Security Check: Student cannot create event (403)
    const studentCreateRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Event',
        description: 'Should be rejected',
        category_id: technicalCatId,
        venue: 'Room 101',
        event_date: '2026-11-20',
        event_time: '10:00',
        capacity: 50,
        organizer: 'Unauthorized Student'
      })
    });
    assert(studentCreateRes.status === 403, '11. Student attempting POST /api/events returns 403 Forbidden');

    // 12. Admin creates event with invalid date (in past) -> 400
    const invalidDateRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Past Event Check',
        description: 'Should fail validation due to past date',
        category_id: technicalCatId,
        venue: 'Room 101',
        event_date: '2020-01-01',
        event_time: '10:00',
        capacity: 50,
        organizer: 'Test Organizer'
      })
    });
    assert(invalidDateRes.status === 400, '12. Admin creating event with past date returns 400 Validation Error');

    // 13. Admin creates valid event -> 201
    const createRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Quantum Computing Hands-on Lab',
        description: 'Comprehensive introduction to Qubits and Qiskit quantum algorithms.',
        category_id: technicalCatId,
        venue: 'Advanced Physics Hall 1',
        event_date: '2026-12-10',
        event_time: '11:00',
        capacity: 1, // capacity of 1 to test full event later
        organizer: 'Quantum Research Group'
      })
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.event.id, '13. POST /api/events by admin returns 201 Created');
    const createdEventId = createData.event.id;

    // 14. Admin updates event -> 200
    const updateRes = await fetch(`${BASE_URL}/events/${createdEventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Quantum Computing Hands-on Lab - Updated',
        description: 'Comprehensive introduction to Qubits and Qiskit quantum algorithms with lab kits.',
        category_id: technicalCatId,
        venue: 'Advanced Physics Hall 1A',
        event_date: '2026-12-10',
        event_time: '11:00',
        capacity: 1,
        organizer: 'Quantum Research Group'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.event.title.includes('Updated'), '14. PUT /api/events/:id by admin returns 200 OK');

    // 15. Student registers for event -> 201
    const regRes = await fetch(`${BASE_URL}/events/${createdEventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(regRes.status === 201, '15. POST /api/events/:id/register returns 201 Registered');

    // 16. Duplicate registration attempt by same student -> 409
    const dupRegRes = await fetch(`${BASE_URL}/events/${createdEventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(dupRegRes.status === 409, '16. Duplicate registration returns 409 Conflict');

    // 17. Full event check: another student attempts to register for capacity 1 event -> 409 Full
    const student2LoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student2@campus.edu', password: 'Student@123' })
    });
    const student2Auth = await student2LoginRes.json();
    const fullEventRes = await fetch(`${BASE_URL}/events/${createdEventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${student2Auth.token}` }
    });
    assert(fullEventRes.status === 409, '17. Registration on full event returns 409 Capacity Reached');

    // 18. Student checks my-registrations -> 200
    const myRegRes = await fetch(`${BASE_URL}/my-registrations`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const myRegData = await myRegRes.json();
    const hasRegisteredEvent = myRegData.registrations.some(r => r.event_id === createdEventId);
    assert(myRegRes.status === 200 && hasRegisteredEvent, '18. GET /api/my-registrations lists registered event');

    // 19. Admin views event attendees -> 200
    const attendeesRes = await fetch(`${BASE_URL}/events/${createdEventId}/registrations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const attendeesData = await attendeesRes.json();
    assert(attendeesRes.status === 200 && attendeesData.registrations.length === 1, '19. GET /api/events/:id/registrations (admin) returns attendee list');

    // 20. Student cannot view event attendees -> 403
    const studentAttendeesRes = await fetch(`${BASE_URL}/events/${createdEventId}/registrations`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(studentAttendeesRes.status === 403, '20. Student viewing event registrations returns 403 Forbidden');

    // 21. Student cancels registration -> 200
    const cancelRes = await fetch(`${BASE_URL}/events/${createdEventId}/register`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(cancelRes.status === 200, '21. DELETE /api/events/:id/register cancels registration (200 OK)');

    // 22. Repeat cancel registration -> 404
    const repeatCancelRes = await fetch(`${BASE_URL}/events/${createdEventId}/register`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(repeatCancelRes.status === 404, '22. Cancelling non-existent registration returns 404 Not Found');

    // 23. Admin deletes event -> 200
    const deleteRes = await fetch(`${BASE_URL}/events/${createdEventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(deleteRes.status === 200, '23. DELETE /api/events/:id by admin returns 200 OK');

    // 24. Verify event is deleted -> 404
    const verifyDeleteRes = await fetch(`${BASE_URL}/events/${createdEventId}`);
    assert(verifyDeleteRes.status === 404, '24. GET deleted event returns 404 Not Found');

    // 25. New user self-registration -> 201
    const testEmail = `newstudent_${Date.now()}@campus.edu`;
    const newRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Campus Student',
        email: testEmail,
        password: 'Password123'
      })
    });
    const newRegData = await newRegRes.json();
    assert(newRegRes.status === 201 && newRegData.token && newRegData.user.role === 'student', '25. POST /api/auth/register creates new student account (201)');

    console.log('\n======================================================');
    console.log(` Test Results: ${passed} PASSED, ${failed} FAILED `);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during test execution:', error);
    process.exit(1);
  }
};

runTests();
