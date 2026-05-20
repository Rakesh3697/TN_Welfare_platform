"""
Database check and reset script
Use this to verify database status and re-insert data if needed
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

def check_database():
    """Check database and table status"""
    DB_CONFIG['database'] = DB_NAME
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("📊 Database Status Check\n")
        print(f"Database: {DB_NAME}")
        print(f"Host: {DB_CONFIG['host']}\n")
        
        tables = ['schemes', 'local_services', 'causes', 'donations', 
                  'applications', 'help_requests', 'volunteers', 'complaints', 'reviews']
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            status = "✓" if count > 0 else "✗"
            print(f"{status} {table}: {count} records")
        
        cursor.close()
        return True
    except Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def clear_data():
    """Clear all data from tables"""
    DB_CONFIG['database'] = DB_NAME
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n🗑️  Clearing all data...\n")
        
        tables = ['donations', 'applications', 'help_requests', 'volunteers', 
                  'complaints', 'reviews', 'causes', 'local_services', 'schemes']
        
        for table in tables:
            cursor.execute(f"DELETE FROM {table}")
            print(f"✓ Cleared {table}")
        
        connection.commit()
        cursor.close()
        print("\n✓ All data cleared!")
        return True
    except Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def insert_all_data():
    """Insert all sample data"""
    DB_CONFIG['database'] = DB_NAME
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n📝 Inserting sample data...\n")
        
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
                "INSERT INTO schemes (id, title, category, desc, status, eligibility) VALUES (%s, %s, %s, %s, %s, %s)",
                scheme
            )
        print("✓ Sample schemes inserted (5)")
        
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
        print("✓ Sample local services inserted (5)")
        
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
                "INSERT INTO causes (id, title, goal, raised, desc, color) VALUES (%s, %s, %s, %s, %s, %s)",
                cause
            )
        print("✓ Sample causes inserted (3)")
        
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
        print("✓ Sample reviews inserted (7)")
        
        connection.commit()
        cursor.close()
        print("\n✅ All sample data inserted successfully!")
        return True
    except Error as e:
        print(f"❌ Error: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if connection:
            connection.close()

if __name__ == '__main__':
    print("=" * 50)
    print("DATABASE CHECK & RESET UTILITY")
    print("=" * 50)
    
    # First check status
    if not check_database():
        print("\n❌ Cannot connect to database. Check your .env file and MySQL connection.")
        exit(1)
    
    # Ask user what to do
    print("\n" + "=" * 50)
    print("Options:")
    print("1. Clear all data and re-insert (Reset)")
    print("2. Just insert data if missing")
    print("3. Exit")
    print("=" * 50)
    
    choice = input("\nSelect option (1-3): ").strip()
    
    if choice == "1":
        if clear_data() and insert_all_data():
            print("\n✅ Database reset complete!")
    elif choice == "2":
        if insert_all_data():
            print("\n✅ Data insertion complete!")
    else:
        print("Exiting...")
