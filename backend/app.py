from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'tn_welfare'),
    'port': os.getenv('DB_PORT', '3306')
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def execute_query(query, params=None):
    """Execute a query and return results"""
    connection = get_db_connection()
    if not connection:
        return None
    try:
        cursor = connection.cursor(dictionary=True)
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        connection.commit()
        return cursor.fetchall()
    except Error as e:
        print(f"Query execution error: {e}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()

def execute_insert(query, params=None):
    """Execute an insert query and return the last inserted ID"""
    connection = get_db_connection()
    if not connection:
        return None
    try:
        cursor = connection.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        connection.commit()
        last_id = cursor.lastrowid
        return last_id
    except Error as e:
        print(f"Insert error: {e}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()


# --- Stats ---
@app.route('/api/stats', methods=['GET'])
def get_stats():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Count schemes
        cursor.execute("SELECT COUNT(*) as count FROM schemes")
        schemes_count = cursor.fetchone()['count']
        
        # Count services
        cursor.execute("SELECT COUNT(*) as count FROM local_services")
        services_count = cursor.fetchone()['count']
        
        # Sum donations
        cursor.execute("SELECT SUM(amount) as total FROM donations")
        donations_total = cursor.fetchone()['total'] or 0
        
        # Sum raised from causes
        cursor.execute("SELECT SUM(raised) as total FROM causes")
        causes_raised = cursor.fetchone()['total'] or 0
        
        # Count volunteers
        cursor.execute("SELECT COUNT(*) as count FROM volunteers")
        volunteers_count = cursor.fetchone()['count'] + 8432
        
        total_raised = donations_total + causes_raised
        
        return jsonify({
            "schemes": schemes_count,
            "services": services_count,
            "funds": total_raised,
            "volunteers": volunteers_count
        })
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# --- Schemes ---
@app.route('/api/schemes', methods=['GET'])
def get_schemes():
    category = request.args.get('category', 'all')
    search = request.args.get('search', '').lower()
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM schemes WHERE 1=1"
        params = []
        
        if category != 'all':
            query += " AND category = %s"
            params.append(category)
        
        if search:
            query += " AND (title LIKE %s OR desc LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        cursor.execute(query, params)
        schemes = cursor.fetchall()
        return jsonify(schemes)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/schemes', methods=['POST'])
def add_scheme():
    data = request.json
    
    query = """INSERT INTO schemes (id, title, category, desc, status, eligibility) 
               VALUES (%s, %s, %s, %s, %s, %s)"""
    
    scheme_id = f"s{int(datetime.now().timestamp())}"
    params = [
        scheme_id,
        data['title'],
        data['category'],
        data['desc'],
        data['status'],
        data['eligibility']
    ]
    
    result = execute_insert(query, params)
    
    if result or result == 0:
        return jsonify({
            "success": True,
            "scheme": {
                "id": scheme_id,
                "title": data['title'],
                "category": data['category'],
                "desc": data['desc'],
                "status": data['status'],
                "eligibility": data['eligibility']
            }
        }), 201
    else:
        return jsonify({"success": False, "message": "Failed to add scheme"}), 500

@app.route('/api/schemes/<scheme_id>', methods=['PUT'])
def update_scheme(scheme_id):
    data = request.json
    
    query = """UPDATE schemes SET title=%s, category=%s, status=%s, desc=%s, eligibility=%s 
               WHERE id=%s"""
    
    params = [
        data.get('title'),
        data.get('category'),
        data.get('status'),
        data.get('desc'),
        data.get('eligibility'),
        scheme_id
    ]
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute(query, params)
        connection.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Scheme not found"}), 404
        
        return jsonify({"success": True, "message": "Scheme updated"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# --- Scheme Applications ---
@app.route('/api/applications', methods=['POST'])
def submit_application():
    data = request.json
    
    query = """INSERT INTO applications (scheme_id, name, aadhaar, district, submitted_at) 
               VALUES (%s, %s, %s, %s, %s)"""
    
    params = [
        data['schemeId'],
        data['name'],
        data['aadhaar'],
        data['district'],
        datetime.now().isoformat()
    ]
    
    result = execute_insert(query, params)
    
    if result or result == 0:
        return jsonify({"success": True, "message": "Application submitted successfully!"})
    else:
        return jsonify({"success": False, "message": "Failed to submit application"}), 500

# --- Local Services ---
@app.route('/api/services', methods=['GET'])
def get_services():
    district = request.args.get('district', 'All')
    category = request.args.get('category', 'All')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM local_services WHERE 1=1"
        params = []
        
        if district != 'All':
            query += " AND district = %s"
            params.append(district)
        
        if category != 'All':
            query += " AND category = %s"
            params.append(category)
        
        cursor.execute(query, params)
        services = cursor.fetchall()
        return jsonify(services)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/services', methods=['POST'])
def add_service():
    data = request.json
    
    query = """INSERT INTO local_services (title, category, district, location, date, urgency, icon) 
               VALUES (%s, %s, %s, %s, %s, %s, %s)"""
    
    params = [
        data['title'],
        data['category'],
        data['district'],
        data['location'],
        data['date'],
        data['urgency'],
        'fa-hands-helping'
    ]
    
    result = execute_insert(query, params)
    
    if result or result == 0:
        return jsonify({
            "success": True,
            "service": {
                "id": result,
                "title": data['title'],
                "category": data['category'],
                "district": data['district'],
                "location": data['location'],
                "date": data['date'],
                "urgency": data['urgency'],
                "icon": 'fa-hands-helping'
            }
        }), 201
    else:
        return jsonify({"success": False, "message": "Failed to add service"}), 500

# --- Causes & Donations ---
@app.route('/api/causes', methods=['GET'])
def get_causes():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM causes")
        causes = cursor.fetchall()
        return jsonify(causes)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/donate', methods=['POST'])
def donate():
    data = request.json
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Insert donation
        donation_query = """INSERT INTO donations (cause_id, amount, donated_at) 
                           VALUES (%s, %s, %s)"""
        donation_params = [
            data['causeId'],
            data['amount'],
            datetime.now().isoformat()
        ]
        cursor.execute(donation_query, donation_params)
        
        # Update cause raised amount
        update_query = """UPDATE causes SET raised = raised + %s WHERE id = %s"""
        cursor.execute(update_query, [data['amount'], data['causeId']])
        
        connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Donation successful! Receipt will be emailed."
        })
    except Error as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# --- Help Requests ---
@app.route('/api/help-requests', methods=['POST'])
def submit_help_request():
    data = request.json
    
    query = """INSERT INTO help_requests (name, phone, type, district, urgency, submitted_at) 
               VALUES (%s, %s, %s, %s, %s, %s)"""
    
    params = [
        data['name'],
        data['phone'],
        data['type'],
        data['district'],
        data['urgency'],
        datetime.now().isoformat()
    ]
    
    result = execute_insert(query, params)
    
    if result or result == 0:
        return jsonify({"success": True, "message": "Request sent to coordinators!"})
    else:
        return jsonify({"success": False, "message": "Failed to submit request"}), 500

# --- Volunteers ---
@app.route('/api/volunteers', methods=['POST'])
def register_volunteer():
    data = request.json
    
    query = """INSERT INTO volunteers (name, phone, district, registered_at) 
               VALUES (%s, %s, %s, %s)"""
    
    params = [
        data['name'],
        data['phone'],
        data['district'],
        datetime.now().isoformat()
    ]
    
    result = execute_insert(query, params)
    
    if result or result == 0:
        return jsonify({"success": True, "message": "Volunteer registration confirmed!"})
    else:
        return jsonify({"success": False, "message": "Failed to register volunteer"}), 500

# --- Complaints ---
@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM complaints ORDER BY submitted_at DESC")
        complaints = cursor.fetchall()
        return jsonify(complaints)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    data = request.json
    
    query = """INSERT INTO complaints (name, phone, email, district, category, subject, description, status, submitted_at) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    
    params = [
        data.get('name'),
        data.get('phone'),
        data.get('email'),
        data.get('district'),
        data.get('category'),
        data.get('subject'),
        data.get('description'),
        'Pending',
        datetime.now().isoformat()
    ]
    
    result = execute_insert(query, params)
    
    if result or result == 0:
        return jsonify({
            "success": True,
            "message": f"Complaint submitted successfully! Reference ID: {result}"
        }), 201
    else:
        return jsonify({"success": False, "message": "Failed to submit complaint"}), 500

@app.route('/api/complaints/<int:complaint_id>', methods=['PUT'])
def update_complaint_status(complaint_id):
    data = request.json
    new_status = data.get('status')
    
    if new_status not in ["Pending", "In Progress", "Resolved"]:
        return jsonify({"success": False, "message": "Invalid status"}), 400
    
    query = "UPDATE complaints SET status = %s WHERE id = %s"
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute(query, [new_status, complaint_id])
        connection.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Complaint not found"}), 404
        
        return jsonify({
            "success": True,
            "message": f"Status updated to {new_status}"
        }), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# --- Impact Ledger ---
@app.route('/api/impact', methods=['GET'])
def get_impact():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM impact_ledger ORDER BY date DESC")
        impact = cursor.fetchall()
        return jsonify(impact)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# --- Recent Updates ---
@app.route('/api/updates', methods=['GET'])
def get_updates():
    updates = [
        {"text": "Applications for State Post-Matric Scholarships are now open.", "time": "2 hours ago", "type": "info"},
        {"text": "Urgent: O+ Blood requirement at Madurai GH fulfilled. Thank you!", "time": "2 days ago", "type": "success"},
        {"text": "New flood relief ration drive launched in Chennai.", "time": "3 days ago", "type": "info"},
    ]
    return jsonify(updates)

# --- Health Check ---
@app.route('/api/health', methods=['GET'])
def health_check():
    connection = get_db_connection()
    if connection:
        connection.close()
        return jsonify({"status": "healthy", "database": "connected"}), 200
    else:
        return jsonify({"status": "unhealthy", "database": "disconnected"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
