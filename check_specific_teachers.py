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

# Check specific Monika ID
monika_id = "6938371bfeaf1d53c55e8fae"
print(f"Monika ID {monika_id} in MongoDB: {monika_id in mongo_teacher_ids}")
print(f"Monika ID {monika_id} in report: {monika_id in report_teacher_ids}")

# Find missing teachers
missing_teachers = mongo_teacher_ids - report_teacher_ids

print(f"\nTotal teachers in MongoDB: {len(mongo_teacher_ids)}")
print(f"Teachers in report: {len(report_teacher_ids)}")
print(f"Missing teachers: {len(missing_teachers)}")

if missing_teachers:
    print("\nMissing teacher IDs:")
    for teacher_id in missing_teachers:
        teacher = next((t for t in mongo_teachers if str(t['_id']) == teacher_id), None)
        if teacher:
            print(f"{teacher_id} - {teacher['name']} - {teacher.get('subjects', [])}")

# Show all Monika entries in report
monika_in_report = report_df[report_df['Teacher Name'].str.contains('Monika', case=False, na=False)]
print(f"\nMonika entries in report: {len(monika_in_report)}")
if len(monika_in_report) > 0:
    print(monika_in_report[['Teacher ID', 'Teacher Name', 'Subject']].to_string(index=False))