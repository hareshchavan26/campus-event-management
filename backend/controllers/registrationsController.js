import pool from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * POST /api/events/:id/register
 * Register current logged-in user for an event
 */
export const registerForEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // 1. Fetch event details with current registration count
  const [eventRows] = await pool.query(`
    SELECT 
      e.id, 
      e.title, 
      e.event_date, 
      e.event_time, 
      e.capacity,
      COUNT(r.id) AS registered_count
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    WHERE e.id = ?
    GROUP BY e.id
  `, [eventId]);

  if (eventRows.length === 0) {
    return next(new AppError(`Event with ID ${eventId} not found.`, 404));
  }

  const event = eventRows[0];
  const registeredCount = Number(event.registered_count);

  // 2. Block registration if event is in the past
  const eventDateTime = new Date(`${event.event_date}T${event.event_time}`);
  if (eventDateTime < new Date()) {
    return next(new AppError('Cannot register for an event that has already ended or passed.', 400));
  }

  // 3. Block registration if user is already registered
  const [existingReg] = await pool.query(
    'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?',
    [userId, eventId]
  );

  if (existingReg.length > 0) {
    return next(new AppError('You are already registered for this event.', 409));
  }

  // 4. Block registration if event is full
  if (registeredCount >= event.capacity) {
    return next(new AppError('Cannot register: this event has already reached full capacity.', 409));
  }

  // 5. Insert registration
  const [insertResult] = await pool.query(
    'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)',
    [userId, eventId]
  );

  res.status(201).json({
    success: true,
    message: `Successfully registered for "${event.title}".`,
    registration_id: insertResult.insertId,
    event_id: Number(eventId),
    seats_left: Math.max(0, event.capacity - (registeredCount + 1))
  });
});

/**
 * DELETE /api/events/:id/register
 * Cancel registration for an event
 */
export const cancelRegistration = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // Check if registration exists
  const [rows] = await pool.query(
    'SELECT r.id, e.title FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.user_id = ? AND r.event_id = ?',
    [userId, eventId]
  );

  if (rows.length === 0) {
    return next(new AppError('You are not registered for this event.', 404));
  }

  await pool.query('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);

  res.status(200).json({
    success: true,
    message: `Successfully cancelled registration for "${rows[0].title}".`
  });
});

/**
 * GET /api/my-registrations
 * Retrieve all events the logged-in student has registered for
 */
export const getMyRegistrations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      r.id AS registration_id,
      r.registered_at,
      e.id AS event_id,
      e.title,
      e.description,
      e.venue,
      e.event_date,
      e.event_time,
      e.capacity,
      e.image_url,
      e.organizer,
      c.id AS category_id,
      c.name AS category_name,
      (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) AS registered_count
    FROM registrations r
    INNER JOIN events e ON r.event_id = e.id
    INNER JOIN categories c ON e.category_id = c.id
    WHERE r.user_id = ?
    ORDER BY e.event_date ASC, e.event_time ASC
  `;

  const [rows] = await pool.query(query, [userId]);

  const registrations = rows.map(item => ({
    ...item,
    registered_count: Number(item.registered_count),
    seats_left: Math.max(0, item.capacity - Number(item.registered_count)),
    image_url: item.image_url || `https://picsum.photos/seed/${item.event_id}/600/400`
  }));

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations
  });
});

/**
 * GET /api/events/:id/registrations
 * Retrieve list of registered attendees for an event (admin only)
 */
export const getEventRegistrations = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;

  // Check event existence
  const [eventRows] = await pool.query(`
    SELECT e.id, e.title, e.capacity, e.event_date, e.event_time, e.venue, c.name as category_name
    FROM events e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `, [eventId]);

  if (eventRows.length === 0) {
    return next(new AppError(`Event with ID ${eventId} not found.`, 404));
  }

  const query = `
    SELECT 
      r.id AS registration_id,
      r.registered_at,
      u.id AS user_id,
      u.name,
      u.email,
      u.role
    FROM registrations r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at DESC
  `;

  const [registrations] = await pool.query(query, [eventId]);
  const registeredCount = registrations.length;
  const capacity = eventRows[0].capacity;

  res.status(200).json({
    success: true,
    event: {
      ...eventRows[0],
      registered_count: registeredCount,
      seats_left: Math.max(0, capacity - registeredCount)
    },
    count: registeredCount,
    registrations
  });
});
