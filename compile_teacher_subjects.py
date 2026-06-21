import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
try:
    client = MongoClient("mongodb+srv://karmansingharora03_db_user:881391726%24Karman@cluster0.9anvuor.mongodb.net/?retryWrites=true&w=majority")
    client.admin.command('ping')
    print("MongoDB connection successful!")
    db = client["test"]
    collection = db["reviews"]
    teachers_collection = db["teachers"]
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    exit(1)

# Fetch all data and create formatted_data (same as main.py)
data = list(collection.find())
formatted_data = []

for entry in data:
    ratings = entry.get("ratings", [])
    rating_values = [r["rating"] for r in ratings]
    theory_ratings = rating_values[:9]
    practical_ratings = rating_values[9:12]
    exam_ratings = rating_values[-3:]

    def average(lst):
        return round(sum(lst) / len(lst), 2) if lst else 0

    formatted_data.append({
        "Teacher ID": str(entry.get("teacherId")),
        "Subject": entry.get("subject"),
        "Branch": entry.get("branch"),
        "Number of Ratings": len(rating_values),
        "Theory Average": average(theory_ratings),
        "Practical Average": average(practical_ratings),
        "Examination Average": average(exam_ratings),
        "Overall Average Rating": average(rating_values),
        "Overall Feedback": entry.get("overallFeedback")
    })

df = pd.DataFrame(formatted_data)

# Get teacher names
teachers_data = list(teachers_collection.find())
teacher_names = {str(t['_id']): t['name'] for t in teachers_data}

# Group by Teacher ID and Subject to calculate averages
teacher_subject_stats = df.groupby(['Teacher ID', 'Subject', 'Branch']).agg({
    'Number of Ratings': 'sum',
    'Theory Average': 'mean',
    'Practical Average': 'mean', 
    'Examination Average': 'mean',
    'Overall Average Rating': 'mean'
}).round(2).reset_index()

# Add teacher names
teacher_subject_stats['Teacher Name'] = teacher_subject_stats['Teacher ID'].map(teacher_names)

# Reorder columns
teacher_subject_stats = teacher_subject_stats[['Teacher ID', 'Teacher Name', 'Subject', 'Branch', 
                                             'Number of Ratings', 'Theory Average', 'Practical Average',
                                             'Examination Average', 'Overall Average Rating']]

# Sort by teacher name and subject
teacher_subject_stats = teacher_subject_stats.sort_values(['Teacher Name', 'Subject'])

# Save to Excel
teacher_subject_stats.to_excel('teacher_subject_performance.xlsx', index=False)

print(f"Teacher-Subject performance report saved to 'teacher_subject_performance.xlsx'")
print(f"Total teacher-subject combinations: {len(teacher_subject_stats)}")