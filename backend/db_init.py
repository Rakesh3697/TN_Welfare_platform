"""
Database initialization script
Run this script once to create the database and tables
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': os.getenv('DB_PORT', '3306')
}

DB_NAME = os.getenv('DB_NAME', 'tn_welfare')

def create_database():
    """Create the database if it doesn't exist"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created or already exists.")
        cursor.close()
    except Error as e:
        print(f"Error creating database: {e}")
    finally:
        if connection:
            connection.close()

def create_tables():
    """Create all required tables"""
    DB_CONFIG['database'] = DB_NAME
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Create schemes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schemes (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                `desc` TEXT,
                status VARCHAR(50),
                eligibility TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Schemes table created")
        
        # Create local_services table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS local_services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                district VARCHAR(100),
                location VARCHAR(255),
                date VARCHAR(100),
                urgency VARCHAR(50),
                icon VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Local Services table created")
        
        # Create causes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS causes (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                goal INT,
                raised INT DEFAULT 0,
                `desc` TEXT,
                color VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Causes table created")
        
        # Create donations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS donations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cause_id VARCHAR(50),
                amount INT,
                donated_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cause_id) REFERENCES causes(id)
            )
        """)
        print("✓ Donations table created")
        
        # Create applications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scheme_id VARCHAR(50),
                name VARCHAR(255),
                aadhaar VARCHAR(20),
                district VARCHAR(100),
                submitted_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (scheme_id) REFERENCES schemes(id)
            )
        """)
        print("✓ Applications table created")
        
        # Create help_requests table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS help_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                phone VARCHAR(20),
                type VARCHAR(100),
                district VARCHAR(100),
                urgency VARCHAR(50),
                submitted_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Help Requests table created")
        
        # Create volunteers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS volunteers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                phone VARCHAR(20),
                district VARCHAR(100),
                registered_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Volunteers table created")
        
        # Create complaints table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS complaints (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                phone VARCHAR(20),
                email VARCHAR(255),
                district VARCHAR(100),
                category VARCHAR(100),
                subject VARCHAR(255),
                description TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                submitted_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Complaints table created")
        
        # Create reviews table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                target_type VARCHAR(50) NOT NULL,
                target_id VARCHAR(50) NOT NULL,
                target_title VARCHAR(255) NOT NULL,
                citizen_name VARCHAR(255) NOT NULL,
                rating INT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✓ Reviews table created")
        
        connection.commit()
        cursor.close()
        print("\n✓ All tables created successfully!")
        
    except Error as e:
        print(f"Error creating tables: {e}")
    finally:
        if connection:
            connection.close()

def insert_sample_data():
    """Insert sample data into the tables"""
    DB_CONFIG['database'] = DB_NAME
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Check if data already exists to avoid duplicates
        cursor.execute("SELECT COUNT(*) FROM schemes")
        if cursor.fetchone()[0] > 0:
            print("\nSample data already exists. Skipping insertion.")
            cursor.close()
            connection.close()
            return
        
        # Insert schemes
        schemes = [
            ("s1", "State Post-Matric Scholarship", "education", 
             "Financial assistance for marginalized communities pursuing higher education.", 
             "Active", "Annual family income below ₹2.5 lakhs. SC/ST/OBC candidates."),
            ("s2", "Chief Minister's Breakfast Scheme", "education", 
             "Providing nutritious breakfast to primary school children to improve attendance.", 
             "Active", "Students enrolled in Government Primary Schools."),
            ("s3", "Makkalai Thedi Maruthuvam", "health", 
             "Healthcare services delivered directly to doorsteps by trained medical teams.", 
             "Active", "All citizens aged 45 years and above."),
            ("s4", "Kalaignar Magalir Urimai Thogai", "women", 
             "Monthly financial assistance of ₹1000 to women heads of households.", 
             "Active", "Women head of family with annual income below ₹2.5 lakhs."),
            ("s5", "Innuyir Kaakum 48 Scheme", "health", 
             "Emergency medical aid and ambulance service within 48 minutes.", 
             "Active", "All citizens of Tamil Nadu."),
        ]
        
        for scheme in schemes:
            cursor.execute(
                "INSERT INTO schemes (id, title, category, `desc`, status, eligibility) VALUES (%s, %s, %s, %s, %s, %s)",
                scheme
            )
        print("✓ Sample schemes inserted")
        
        # Insert local services
        services = [
            ("Mega Blood Donation Drive", "Blood Donation", "Chennai", 
             "Rajiv Gandhi Govt Hospital, Ward 4", "Today, 9:00 AM - 4:00 PM", "High", "fa-tint"),
            ("Flood Relief Ration Distribution", "Disaster Relief", "Chennai", 
             "Govt Higher Secondary School, Kotturpuram", "Today, 12:00 PM - 6:00 PM", "Critical", "fa-box-open"),
            ("Orphanage Lunch Sponsorship", "Food Donation", "Coimbatore", 
             "Anbu Illam Trust, RS Puram", "Sunday, 12:30 PM - 2:00 PM", "Normal", "fa-utensils"),
            ("Free Eye Camp", "Medical Camp", "Madurai", 
             "Meenakshi Mission Hospital", "This Saturday, 8:00 AM", "Normal", "fa-eye"),
            ("Stationery & Books Drive", "Educational Assistance", "Trichy", 
             "District Collectorate Grounds", "Next Monday, 10:00 AM", "Normal", "fa-book"),
        ]
        
        for service in services:
            cursor.execute(
                "INSERT INTO local_services (title, category, district, location, date, urgency, icon) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                service
            )
        print("✓ Sample local services inserted")
        
        # Insert causes
        causes = [
            ("c1", "Disaster Relief Support", 5000000, 3200000, 
             "Provide immediate food, shelter, and medical assistance to flood victims.", "blue"),
            ("c2", "Free Medical Camps", 1000000, 450000, 
             "Fund medical supplies and doctors for free health camps in rural areas.", "green"),
            ("c3", "Girl Child Education Fund", 2000000, 1100000, 
             "Sponsor education for underprivileged girl children in Tamil Nadu.", "purple"),
        ]
        
        for cause in causes:
            cursor.execute(
                "INSERT INTO causes (id, title, goal, raised, `desc`, color) VALUES (%s, %s, %s, %s, %s, %s)",
                cause
            )
        print("✓ Sample causes inserted")
        
        # Insert sample reviews
        reviews = [
            ("scheme", "s2", "Chief Minister's Breakfast Scheme", "Anjali Devi", 5, "My kids absolutely love the hot breakfast! They are very eager to go to school early now so they don't miss it."),
            ("scheme", "s3", "Makkalai Thedi Maruthuvam", "Ramesh Kumar", 5, "The mobile medical team visited our home and diagnosed my mother's high blood pressure. They delivered the medicines right to our doorstep. Incredible work!"),
            ("scheme", "s1", "State Post-Matric Scholarship", "Karthik Raja", 4, "The scholarship funds were credited to my account on time. Excellent support, but the portal registration was slightly slow during peak hours."),
            ("scheme", "s4", "Kalaignar Magalir Urimai Thogai", "Meenakshi S.", 5, "This monthly ₹1000 aid has been an absolute blessing. I used it to purchase raw tailoring materials, which boosted my small scale sewing business."),
            ("service", "1", "Mega Blood Donation Drive", "Suresh Kumar", 5, "Extremely well organized drive at the Government Hospital. The doctors and volunteers were very professional. They even provided snacks and juices after donation!"),
            ("service", "2", "Flood Relief Ration Distribution", "Vijay A.", 4, "Appreciate the quick distribution of grocery kits during the heavy rains in Kotturpuram. Helpful coordinators on the ground."),
            ("service", "3", "Orphanage Lunch Sponsorship", "Deepika R.", 5, "Highly transparent service. The coordinators sent pictures and verified the lunch delivery at the orphanage. Heartwarming experience.")
        ]
        
        for record in reviews:
            cursor.execute(
                "INSERT INTO reviews (target_type, target_id, target_title, citizen_name, rating, comment) VALUES (%s, %s, %s, %s, %s, %s)",
                record
            )
        print("✓ Sample reviews inserted")
        
        connection.commit()
        cursor.close()
        print("\n✓ All sample data inserted successfully!")
        
    except Error as e:
        print(f"Error inserting sample data: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()

if __name__ == '__main__':
    print("🔄 Initializing database...\n")
    create_database()
    create_tables()
    insert_sample_data()
    print("\n✅ Database initialization complete!")
    print("\nNote: Update the .env file with your MySQL credentials before running the Flask app.")
