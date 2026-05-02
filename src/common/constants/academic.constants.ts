export const BRANCH_OPTIONS = [
  'CSE-A',
  'CSE-B',
  'Electrical',
  'Mechanical',
  'Civil',
  'Architecture',
] as const;

export const SEMESTER_OPTIONS = [
  '2nd',
  '4th',
] as const;

export const ACADEMIC_OPTIONS = {
  branches: BRANCH_OPTIONS,
  semesters: SEMESTER_OPTIONS,
};
