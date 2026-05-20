# Backend Database Setup Guide

## Prerequisites
- MySQL Server installed and running
- Python 3.7+
- pip (Python package manager)

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database Connection
Edit the `.env` file in the backend directory with your MySQL credentials:

```env
DB_HOST=localhost          # MySQL host
DB_USER=root              # MySQL username
DB_PASSWORD=your_password # MySQL password
DB_NAME=tn_welfare        # Database name
DB_PORT=3306              # MySQL port (default: 3306)
```

### 3. Initialize the Database
Run the database initialization script to create tables and insert sample data:

```bash
python db_init.py
```

This script will:
- ✓ Create the `tn_welfare` database (if not exists)
- ✓ Create all required tables:
  - `schemes` - Welfare schemes
  - `local_services` - Local services
  - `causes` - Donation causes
  - `donations` - Donation records
  - `applications` - Scheme applications
  - `help_requests` - Help requests
  - `volunteers` - Volunteer registrations
  - `complaints` - User complaints
  - `impact_ledger` - Impact records
- ✓ Insert sample data for testing

### 4. Run the Flask Application
```bash
python app.py
```

The backend will start on `http://localhost:5000`

## Database Schema

### Schemes Table
```sql
- id (VARCHAR 50, PRIMARY KEY)
- title (VARCHAR 255)
- category (VARCHAR 100)
- desc (TEXT)
- status (VARCHAR 50)
- eligibility (TEXT)
- created_at (TIMESTAMP)
```

### Local Services Table
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- title (VARCHAR 255)
- category (VARCHAR 100)
- district (VARCHAR 100)
- location (VARCHAR 255)
- date (VARCHAR 100)
- urgency (VARCHAR 50)
- icon (VARCHAR 50)
- created_at (TIMESTAMP)
```

### Causes Table
```sql
- id (VARCHAR 50, PRIMARY KEY)
- title (VARCHAR 255)
- goal (INT)
- raised (INT)
- desc (TEXT)
- color (VARCHAR 50)
- created_at (TIMESTAMP)
```

### Donations Table
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- cause_id (VARCHAR 50, FOREIGN KEY)
- amount (INT)
- donated_at (DATETIME)
- created_at (TIMESTAMP)
```

### Applications Table
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- scheme_id (VARCHAR 50, FOREIGN KEY)
- name (VARCHAR 255)
- aadhaar (VARCHAR 20)
- district (VARCHAR 100)
- submitted_at (DATETIME)
- created_at (TIMESTAMP)
```

### Help Requests Table
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- name (VARCHAR 255)
- phone (VARCHAR 20)
- type (VARCHAR 100)
- district (VARCHAR 100)
- urgency (VARCHAR 50)
- submitted_at (DATETIME)
- created_at (TIMESTAMP)
```

### Volunteers Table
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- name (VARCHAR 255)
- phone (VARCHAR 20)
- district (VARCHAR 100)
- registered_at (DATETIME)
- created_at (TIMESTAMP)
```

### Complaints Table
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- name (VARCHAR 255)
- phone (VARCHAR 20)
- email (VARCHAR 255)
- district (VARCHAR 100)
- category (VARCHAR 100)
- subject (VARCHAR 255)
- description (TEXT)
- status (VARCHAR 50, DEFAULT 'Pending')
- submitted_at (DATETIME)
- created_at (TIMESTAMP)
```

### Impact Ledger Table
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- date (DATE)
- category (VARCHAR 100)
- location (VARCHAR 255)
- impact (TEXT)
- status (VARCHAR 50)
- created_at (TIMESTAMP)
```

## API Endpoints

### Stats
- `GET /api/stats` - Get overall statistics

### Schemes
- `GET /api/schemes` - Get all schemes (with optional filters: category, search)
- `POST /api/schemes` - Add a new scheme
- `PUT /api/schemes/<id>` - Update a scheme

### Applications
- `POST /api/applications` - Submit a scheme application

### Services
- `GET /api/services` - Get local services (with optional filters: district, category)
- `POST /api/services` - Add a new service

### Causes
- `GET /api/causes` - Get all causes
- `POST /api/donate` - Make a donation

### Help Requests
- `POST /api/help-requests` - Submit a help request

### Volunteers
- `POST /api/volunteers` - Register as a volunteer

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Submit a complaint
- `PUT /api/complaints/<id>` - Update complaint status

### Impact
- `GET /api/impact` - Get impact records

### Updates
- `GET /api/updates` - Get recent updates

### Health Check
- `GET /api/health` - Check database connection status

## Troubleshooting

### Database Connection Error
- Ensure MySQL server is running
- Check `.env` file for correct credentials
- Verify database name exists

### Table Creation Error
- Make sure you have proper permissions
- Try dropping existing tables first: `DROP TABLE IF EXISTS table_name;`

### No Sample Data
- Run `python db_init.py` again to insert sample data

## Frontend Configuration

Update the frontend API URL in your frontend code to match the backend:
```javascript
// Example: In your React app
const API_URL = 'http://localhost:5000/api';
```

## Production Deployment

For production:
1. Set `debug=False` in `app.py`
2. Use a production WSGI server like Gunicorn
3. Use environment variables for sensitive credentials
4. Enable HTTPS
5. Set up proper database backups
6. Use a dedicated database user with limited permissions
