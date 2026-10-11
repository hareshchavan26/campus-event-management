import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool using promise-based API
const isRemoteDb = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_events',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // Return date as formatted string (YYYY-MM-DD) to prevent timezone offsets
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined
});

// Verify MySQL connection on startup with helpful diagnostics
export const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'campus_events'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('================================================================');
    console.error('[Database Error] Failed to connect to MySQL database!');
    console.error(`Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.error(`Database: ${process.env.DB_NAME || 'campus_events'}`);
    console.error(`User: ${process.env.DB_USER || 'root'}`);
    console.error(`Code: ${error.code} | Message: ${error.message}`);
    console.error('Troubleshooting tips:');
    console.error('1. Ensure MySQL server is running (e.g., via XAMPP, native MySQL service, or local mysqld).');
    console.error('2. Verify credentials in backend/.env match your database settings.');
    console.error('3. Run "mysql -u root < database/schema.sql" to initialize schema if database is missing.');
    console.error('================================================================');
    return false;
  }
};

export default pool;
