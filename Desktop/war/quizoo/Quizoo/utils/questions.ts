import axios from 'axios';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const API_KEY = 'AIzaSyDDuCc_V3eZavSm91--KyZcjaPToF_MCPU';
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export const fetchQuizQuestions = async (
  grade: string,
  subject: string,
  chapter: string,
  numberOfQuestions: number,
  difficulty: string
): Promise<QuizQuestion[]> => {
  console.log(grade, subject, chapter, numberOfQuestions, difficulty);

  const prompt = `Generate ${numberOfQuestions} multiple choice quiz questions for class ${grade} ${subject} chapter ${chapter} in the format:

Question: <question text>
Options: <Option 1>, <Option 2>, <Option 3>, <Option 4>
Correct Answer: <correct answer>
Difficulty: ${difficulty}

Do not provide any explanations, only the questions and options with one correct answer for each. Ensure that there are exactly 4 options for each question.`;

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
    console.log(textOutput);

    const questionBlocks = textOutput.split('\n\n');

    const questions: QuizQuestion[] = questionBlocks
      .map((block) => {
        const lines = block.split('\n').map(line => line.trim());

        // Ensure proper formatting: Question, Options, Correct Answer
        if (
          lines.length < 3 ||
          !lines[0].startsWith('Question:') ||
          !lines[1].startsWith('Options:') ||
          !lines[2].startsWith('Correct Answer:')
        ) {
          return null; // Skip malformed blocks
        }

        const questionText = lines[0].replace('Question: ', '');
        const options = lines[1].replace('Options: ', '').split(',').map(o => o.trim());
        const correctAnswer = lines[2].replace('Correct Answer: ', '');

        // Ensure only 4 options, filter any extra options
        const validOptions = options.slice(0, 4);

        return {
          question: questionText,
          options: validOptions,
          correctAnswer,
        };
      })
      .filter((q): q is QuizQuestion => q !== null); // Remove null entries

    return questions;
  } catch (error) {
    console.error('Error fetching quiz questions from Gemini API:', error);
    return [];
  }
};
