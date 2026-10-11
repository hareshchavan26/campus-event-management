# Campus Event Management System (CampusPulse)

A complete, production-quality full-stack web application designed for universities to manage, discover, and RSVP for campus events, workshops, hackathons, seminars, and sports tournaments.

---

## 📌 Features

### 🎓 Student Features
- **Interactive Event Discovery**: Browse events by title, description, venue, or host club with real-time keyword search.
- **Category Filtering**: Filter events by 5 official categories: `Technical`, `Cultural`, `Sports`, `Workshop`, and `Seminar`.
- **Live Seat Counter & Badges**: Real-time quota indicators showing available seats, low-capacity warnings (red when < 10 seats), and full capacity locks.
- **1-Click RSVP & Cancellation**: Instant registration and ability to cancel tickets, which immediately releases seats to other students.
- **My Registrations Dashboard**: Personal portal to review all registered tickets, upcoming schedules, and event venues.

### 🛡️ Admin Features
- **Centralized Event Dashboard**: Comprehensive metrics overview (Total Events, Registrations, Total Seating Capacity) and searchable event table.
- **Event Lifecycle Management**: Create, edit, and delete campus events with client- and server-side validation.
- **Attendee Registry**: View the full list of students registered for any specific event with registration timestamps and exportable records.
- **Cascading Safety**: Deleting an event safely cleans up associated registrations without database inconsistencies.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 + Vite | JavaScript (ES Modules), React Router v6, Axios |
| **Styling** | Bootstrap 5.3 + Bootstrap Icons | Custom modern Indigo theme (`#4f46e5`) & responsive grid |
| **Backend** | Node.js 20/22 LTS + Express 4 | ES Modules, centralized error handling, async wrapper |
| **Database** | MySQL 8 / MariaDB 10+ | `mysql2` Promise API, parameterized SQL queries, foreign keys with `ON DELETE CASCADE` |
| **Auth & Security** | JWT + bcryptjs | 7-day token expiry, salted password hashing, express-validator |

---

## 📋 Prerequisites

Before running the project locally, ensure you have:
1. **Node.js** (v20 or v22 LTS) and **npm** installed (`node -v`, `npm -v`)
2. **MySQL Server 8.0+** or MariaDB running on `localhost:3306`

---

## 🚀 Step-by-Step Local Setup

### 1. Database Initialization
Open your terminal and initialize the MySQL database schema:
```bash
mysql -u root -p < database/schema.sql
```
*(If your local MySQL root user has no password, simply run `mysql -u root < database/schema.sql`)*

### 2. Backend Configuration & Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   # On Windows PowerShell:
   Copy-Item .env.example .env
   ```
3. Update `.env` with your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=campus_events
   JWT_SECRET=campus_events_super_secret_jwt_key_2026_dev
   CLIENT_URL=http://localhost:5173
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Seed the database with demo users, categories, and 12 future events:
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   # App runs at http://localhost:5173
   ```

---

## 🔑 Default Credentials

The seed script creates the following accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@campus.edu` | `Admin@123` | Create, edit, delete events, view attendee lists |
| **Student 1** | `student1@campus.edu` | `Student@123` | Browse, RSVP, cancel registration, view tickets |
| **Student 2** | `student2@campus.edu` | `Student@123` | Browse, RSVP, cancel registration, view tickets |
| **Student 3** | `student3@campus.edu` | `Student@123` | Browse, RSVP, cancel registration, view tickets |

*(Tip: The login page includes 1-click quick-fill buttons for both Admin and Student demo accounts!)*

---

## 🌐 API Endpoint Table

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Service health check |
| `POST` | `/api/auth/register` | Public | Register new student (`{name, email, password}`) |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/categories` | Public | List all event categories |
| `GET` | `/api/events` | Public | List events (`?search=&category=`), includes seat counts |
| `GET` | `/api/events/:id` | Public | Get single event details with user registration status |
| `POST` | `/api/events` | Admin Only | Create new event with capacity and validation |
| `PUT` | `/api/events/:id` | Admin Only | Update existing event |
| `DELETE`| `/api/events/:id` | Admin Only | Delete event and cascade attendee records |
| `POST` | `/api/events/:id/register` | Student/Auth | Register for event (enforces capacity & past date checks) |
| `DELETE`| `/api/events/:id/register` | Student/Auth | Cancel event registration |
| `GET` | `/api/my-registrations` | Student/Auth | List events registered by current logged-in student |
| `GET` | `/api/events/:id/registrations`| Admin Only | View attendee list for a specific event |

---

## 🚢 How to Deploy This Application

You can deploy this application using any of the three standard production methods below:

### Option A: Free Tier Cloud PaaS (Vercel / Render / Railway)

1. **Database (Free Managed MySQL)**:
   - Create a free MySQL database on [Aiven.io](https://aiven.io/), [Railway](https://railway.app/), or [Clever Cloud](https://www.clever-cloud.com/).
   - Connect using MySQL Workbench or CLI and run `database/schema.sql`.

2. **Backend (Render or Railway)**:
   - Push your code to GitHub.
   - On [Render](https://render.com/), create a new **Web Service**, select the repo, set root directory to `backend`.
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Set Environment Variables:
     - `PORT=5000`
     - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from your managed MySQL)
     - `JWT_SECRET=your_production_secret`
     - `CLIENT_URL=https://your-frontend.vercel.app`

3. **Frontend (Vercel or Netlify)**:
   - On [Vercel](https://vercel.com/), create a new project and select the `frontend` folder.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Set Environment Variable:
     - `VITE_API_URL=https://your-backend.onrender.com/api`

---

### Option B: Docker Compose (Single Command Deployment)

A production-ready `docker-compose.yml` is included in the project root:

1. Ensure Docker & Docker Compose are installed.
2. From `campus-event-management/`, run:
   ```bash
   docker compose up -d --build
   ```
3. Docker will automatically:
   - Spin up a MySQL 8 container with healthchecks and auto-execute `database/schema.sql`
   - Build and start the Express backend container on port 5000
   - Build and start the Nginx-hosted Vite frontend container on port 80
4. Visit `http://localhost` in your browser!

To seed the database inside Docker:
```bash
docker compose exec backend npm run seed
```

---

### Option C: Ubuntu VPS (AWS EC2 / DigitalOcean / Linode)

1. **Install Node.js 22, MySQL 8, and Nginx**:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm mysql-server nginx
   sudo npm install -g pm2
   ```

2. **Setup MySQL**:
   ```bash
   sudo mysql < database/schema.sql
   sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourSecurePassword';"
   ```

3. **Deploy Backend with PM2**:
   ```bash
   cd backend
   npm install --production
   pm2 start server.js --name "campus-backend"
   pm2 startup && pm2 save
   ```

4. **Build Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run build
   sudo cp -r dist/* /var/www/html/
   ```

5. **Configure Nginx**:
   Edit `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
       }
   }
   ```
   Restart Nginx: `sudo systemctl restart nginx`.
   Enable HTTPS: `sudo certbot --nginx -d yourdomain.com`.

---

## 🔧 Troubleshooting Guide

### 1. `ER_NOT_SUPPORTED_AUTH_MODE`
- **Cause**: MySQL 8 default authentication plugin (`caching_sha2_password`) is incompatible with some client connections.
- **Solution**: Execute the following in your MySQL CLI:
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
  FLUSH PRIVILEGES;
  ```

### 2. `ER_ACCESS_DENIED_ERROR`
- **Cause**: Incorrect username or password in `backend/.env`.
- **Solution**: Check `backend/.env` credentials. Verify by logging in directly from terminal:
  ```bash
  mysql -u root -p
  ```

### 3. `CORS Error` (Cross-Origin Resource Sharing)
- **Cause**: Frontend origin does not match `CLIENT_URL` configured in `backend/.env`.
- **Solution**: Set `CLIENT_URL=http://localhost:5173` in `backend/.env` (or your production frontend domain) and restart backend.

### 4. Port Already in Use (`EADDRINUSE: 5000` or `5173`)
- **Windows**:
  ```powershell
  # Find PID using port 5000
  netstat -ano | findstr :5000
  # Terminate process by PID
  taskkill /PID <PID> /F
  ```
- **Linux/macOS**:
  ```bash
  lsof -ti :5000 | xargs kill -9
  ```

### 5. `ECONNREFUSED` (Cannot connect to MySQL)
- **Cause**: MySQL server is stopped or port is not listening on 3306.
- **Solution**:
  - Windows: Open Services (`services.msc`) and start `MySQL80` (or start your local mysqld).
  - Linux: Run `sudo systemctl status mysql` and `sudo systemctl start mysql`.
