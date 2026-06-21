import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb+srv://karmansingharora03_db_user:881391726%24Karman@cluster0.9anvuor.mongodb.net/?retryWrites=true&w=majority")
db = client["test"]
teachers_collection = db["teachers"]

# Get all teachers from MongoDB
mongo_teachers = list(teachers_collection.find())
mongo_teacher_ids = set(str(t['_id']) for t in mongo_teachers)

# Read the generated report
report_df = pd.read_excel('teacher_subject_performance.xlsx')
report_teacher_ids = set(report_df['Teacher ID'])

# Find missing teachers
missing_teachers = mongo_teacher_ids - report_teacher_ids

print(f"Total teachers in MongoDB: {len(mongo_teacher_ids)}")
print(f"Teachers in report: {len(report_teacher_ids)}")
print(f"Missing teachers: {len(missing_teachers)}")

if missing_teachers:
    print("\nMissing teachers:")
    for teacher in mongo_teachers:
        if str(teacher['_id']) in missing_teachers:
            print(f"{teacher['_id']} - {teacher['name']} - {teacher.get('subjects', [])}")