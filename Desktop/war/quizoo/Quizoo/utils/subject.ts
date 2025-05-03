import axios from 'axios';

export interface Subject {
  name: string;
  description: string;
}

export const fetchSubjectsByGrade = async (grade: string): Promise<Subject[]> => {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDDuCc_V3eZavSm91--KyZcjaPToF_MCPU',
      {
        contents: [
          {
            parts: [
              {
                text: `List the basic school subjects taught in grade ${grade} in India in the following format:

                Subject: <Name>
                Description: <One short line about it>

                Only give 1–5 subjects, no extra text. and pls make sure no regional languages or hindi or art subject is mentioned there`,
              },
            ],
          },
        ],
      }
    );

    const text: string = response.data.candidates[0].content.parts[0].text;

    const subjects: Subject[] = text
      .split('\n\n')
      .map((block: string): Subject | null => {
        const nameMatch = block.match(/Subject:\s*(.*)/);
        const descMatch = block.match(/Description:\s*(.*)/);
        if (nameMatch && descMatch) {
          return {
            name: nameMatch[1].trim(),
            description: descMatch[1].trim(),
          };
        }
        return null;
      })
      .filter((item: Subject | null): item is Subject => item !== null);

    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};
