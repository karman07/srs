import pandas as pd

# Read CSV file
csv_teachers = pd.read_csv("test.teachers.csv")
csv_teacher_ids = set(csv_teachers['_id'].astype(str))

# Read the generated teacher-subject report
report_df = pd.read_excel('teacher_subject_performance.xlsx')
report_teacher_ids = set(report_df['Teacher ID'])

# Find missing teachers
missing_teachers = csv_teacher_ids - report_teacher_ids
missing_count = len(missing_teachers)

print(f"Total teachers in CSV: {len(csv_teacher_ids)}")
print(f"Teachers in report: {len(report_teacher_ids)}")
print(f"Missing teachers: {missing_count}")

if missing_teachers:
    missing_info = csv_teachers[csv_teachers['_id'].astype(str).isin(missing_teachers)]
    print("\nMissing teachers:")
    print(missing_info[['_id', 'name', 'subjects[0]']].to_string(index=False))