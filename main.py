import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
try:
    client = MongoClient("mongodb+srv://karmansingharora03_db_user:881391726%24Karman@cluster0.9anvuor.mongodb.net/?retryWrites=true&w=majority")
    # Test the connection
    client.admin.command('ping')
    print("MongoDB connection successful!")
    db = client["test"]
    collection = db["reviews"]
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    print("Please check your connection string and cluster status.")
    exit(1)

# Fetch all data
data = list(collection.find())

# Prepare formatted data
formatted_data = []

for entry in data:
    ratings = entry.get("ratings", [])
    rating_values = [r["rating"] for r in ratings]

    # Slicing
    theory_ratings = rating_values[:9]
    practical_ratings = rating_values[9:12]
    exam_ratings = rating_values[-3:]

    # Calculate Averages
    def average(lst):
        return round(sum(lst) / len(lst), 2) if lst else 0

    formatted_data.append({
        "Feedback ID": str(entry.get("_id")),
        "Student ID": str(entry.get("studentId")),
        "Teacher ID": str(entry.get("teacherId")),
        "Subject": entry.get("subject"),
        "Branch": entry.get("branch"),
        "Number of Ratings": len(rating_values),
        "Theory Average": average(theory_ratings),
        "Practical Average": average(practical_ratings),
        "Examination Average": average(exam_ratings),
        "Overall Average Rating": average(rating_values),
        "Overall Feedback": entry.get("overallFeedback"),
        "Created At": entry.get("createdAt"),
        "Updated At": entry.get("updatedAt")
    })

# Convert to DataFrame
df = pd.DataFrame(formatted_data)

# Export to Excel
df.to_excel("formatted_feedback.xlsx", index=False)

print("Excel file 'formatted_feedback.xlsx' created successfully.")
