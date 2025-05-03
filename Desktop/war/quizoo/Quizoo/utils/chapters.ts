import axios from 'axios';

export interface Chapter {
  number: string;
  title: string;
}

const API_KEY = 'AIzaSyDDuCc_V3eZavSm91--KyZcjaPToF_MCPU';
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export const fetchChaptersBySubject = async (
  grade: string,
  subject: string
): Promise<Chapter[]> => {
  const prompt = `List all chapter titles for class ${grade} ${subject} from CBSE/NCERT syllabus. 
Only provide the chapter titles, one per line.
Do not include chapter numbers or any other explanation.`;

  try {
    const response = await axios.post(GEMINI_API, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    const textOutput: string =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log(grade, subject);
    console.log(textOutput);

    const chapters: Chapter[] = textOutput
      .split('\n')
      .map((line, index) => ({
        number: `Chapter ${index + 1}`,
        title: line.trim(),
      }))
      .filter((chapter) => chapter.title.length > 0);

    return chapters;
  } catch (error) {
    console.error('Error fetching chapters from Gemini API:', error);
    return [];
  }
};
