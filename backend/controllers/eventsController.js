import pool from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/events
 * List all events with search, category filtering, registered counts, and seats left
 */
export const getEvents = asyncHandler(async (req, res) => {
  const { search, category } = req.query;

  let query = `
    SELECT 
      e.id,
      e.title,
      e.description,
      e.category_id,
      c.name AS category_name,
      e.venue,
      e.event_date,
      e.event_time,
      e.capacity,
      e.image_url,
      e.organizer,
      e.created_by,
      e.created_at,
      COUNT(r.id) AS registered_count,
      GREATEST(0, e.capacity - COUNT(r.id)) AS seats_left
    FROM events e
    INNER JOIN categories c ON e.category_id = c.id
    LEFT JOIN registrations r ON e.id = r.event_id
    WHERE 1=1
  `;

  const params = [];

  if (search && search.trim() !== '') {
    query += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ? OR e.organizer LIKE ?)`;
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  if (category && category.trim() !== '') {
    // Check if category query is an ID or a Name
    if (!isNaN(category)) {
      query += ` AND e.category_id = ?`;
      params.push(Number(category));
    } else {
      query += ` AND c.name = ?`;
      params.push(category.trim());
    }
  }

  query += `
    GROUP BY e.id, c.name
    ORDER BY e.event_date ASC, e.event_time ASC
  `;

  const [rows] = await pool.query(query, params);

  // Format response rows ensuring numerical types for counts
  const events = rows.map(event => ({
    ...event,
    registered_count: Number(event.registered_count),
    seats_left: Number(event.seats_left),
    image_url: event.image_url || `https://picsum.photos/seed/${event.id}/600/400`
  }));

  res.status(200).json({
    success: true,
    count: events.length,
    events
  });
});

/**
 * GET /api/events/:id
 * Retrieve details for a single event, including registration status for current user if logged in
 */
export const getEventById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const query = `
    SELECT 
      e.id,
      e.title,
      e.description,
      e.category_id,
      c.name AS category_name,
      e.venue,
      e.event_date,
      e.event_time,
      e.capacity,
      e.image_url,
      e.organizer,
      e.created_by,
      u.name AS created_by_name,
      e.created_at,
      COUNT(r.id) AS registered_count,
      GREATEST(0, e.capacity - COUNT(r.id)) AS seats_left
    FROM events e
    INNER JOIN categories c ON e.category_id = c.id
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN registrations r ON e.id = r.event_id
    WHERE e.id = ?
    GROUP BY e.id, c.name, u.name
  `;

  const [rows] = await pool.query(query, [id]);

  if (rows.length === 0) {
    return next(new AppError(`Event with ID ${id} not found.`, 404));
  }

  const event = {
    ...rows[0],
    registered_count: Number(rows[0].registered_count),
    seats_left: Number(rows[0].seats_left),
    image_url: rows[0].image_url || `https://picsum.photos/seed/${rows[0].id}/600/400`
  };

  // Check if current authenticated user has registered
  let isRegistered = false;
  if (req.user) {
    const [userReg] = await pool.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
      [id, req.user.id]
    );
    isRegistered = userReg.length > 0;
  }

  res.status(200).json({
    success: true,
    event: {
      ...event,
      is_registered: isRegistered
    }
  });
});

/**
 * POST /api/events
 * Create a new event (admin only)
 */
export const createEvent = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    category_id,
    venue,
    event_date,
    event_time,
    capacity,
    image_url,
    organizer
  } = req.body;

  // Verify category exists
  const [catRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
  if (catRows.length === 0) {
    return next(new AppError(`Category with ID ${category_id} does not exist.`, 400));
  }

  const insertQuery = `
    INSERT INTO events 
      (title, description, category_id, venue, event_date, event_time, capacity, image_url, organizer, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(insertQuery, [
    title,
    description,
    category_id,
    venue,
    event_date,
    event_time,
    capacity,
    image_url || null,
    organizer,
    req.user.id
  ]);

  const newEventId = result.insertId;
  const finalImageUrl = image_url || `https://picsum.photos/seed/${newEventId}/600/400`;

  // Update default image if none was provided
  if (!image_url) {
    await pool.query('UPDATE events SET image_url = ? WHERE id = ?', [finalImageUrl, newEventId]);
  }

  const [createdRows] = await pool.query(`
    SELECT e.*, c.name AS category_name 
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.id = ?
  `, [newEventId]);

  res.status(201).json({
    success: true,
    message: 'Event created successfully.',
    event: {
      ...createdRows[0],
      registered_count: 0,
      seats_left: Number(createdRows[0].capacity)
    }
  });
});

/**
 * PUT /api/events/:id
 * Update an existing event (admin only)
 */
export const updateEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    category_id,
    venue,
    event_date,
    event_time,
    capacity,
    image_url,
    organizer
  } = req.body;

  // Check if event exists
  const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [id]);
  if (existing.length === 0) {
    return next(new AppError(`Event with ID ${id} not found.`, 404));
  }

  // Verify category exists
  const [catRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
  if (catRows.length === 0) {
    return next(new AppError(`Category with ID ${category_id} does not exist.`, 400));
  }

  // Capacity check: capacity cannot be lower than already registered students
  const [regCountRow] = await pool.query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [id]);
  const currentRegistrations = regCountRow[0].count;
  if (capacity < currentRegistrations) {
    return next(new AppError(`Cannot reduce capacity to ${capacity}. There are already ${currentRegistrations} students registered.`, 400));
  }

  const updateQuery = `
    UPDATE events
    SET title = ?,
        description = ?,
        category_id = ?,
        venue = ?,
        event_date = ?,
        event_time = ?,
        capacity = ?,
        image_url = ?,
        organizer = ?
    WHERE id = ?
  `;

  const finalImageUrl = image_url || `https://picsum.photos/seed/${id}/600/400`;

  await pool.query(updateQuery, [
    title,
    description,
    category_id,
    venue,
    event_date,
    event_time,
    capacity,
    finalImageUrl,
    organizer,
    id
  ]);

  const [updatedRows] = await pool.query(`
    SELECT e.*, c.name AS category_name,
      COUNT(r.id) AS registered_count,
      GREATEST(0, e.capacity - COUNT(r.id)) AS seats_left
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    LEFT JOIN registrations r ON e.id = r.event_id
    WHERE e.id = ?
    GROUP BY e.id, c.name
  `, [id]);

  res.status(200).json({
    success: true,
    message: 'Event updated successfully.',
    event: {
      ...updatedRows[0],
      registered_count: Number(updatedRows[0].registered_count),
      seats_left: Number(updatedRows[0].seats_left)
    }
  });
});

/**
 * DELETE /api/events/:id
 * Delete an event and associated registrations (admin only)
 */
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT id, title FROM events WHERE id = ?', [id]);
  if (existing.length === 0) {
    return next(new AppError(`Event with ID ${id} not found.`, 404));
  }

  await pool.query('DELETE FROM events WHERE id = ?', [id]);

  res.status(200).json({
    success: true,
    message: `Event "${existing[0].title}" deleted successfully.`
  });
});
