export type RootStackParamList = {
    Splash: undefined;
    Home: undefined;
    Auth: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    VerifyEmail: undefined;
    Subjects: { grade: string };
    Chapters: {grade:string, subject:string;};
    StartQuiz: { grade: string;
      subject: string;
      chapter: string;};
    QuizScreen: { 
      grade: string; 
      subject: string; 
      chapter: string; 
      numberOfQuestions: number; 
      difficulty: string; 
    }; // Params for Quiz screen (grade, subject, chapter, number of questions, and difficulty passed)
    ResultScreen: {
      correct: number;
      wrong: number;
      unanswered: number;
      subject: string;
      chapter: string;
      grade: string;
      quizNumber: number;
    }; // Params for Result screen (correct, wrong, unanswered, subject, chapter passed)
    QuizSummaryScreen: {
      quizNumber:number
      grade: string
      subject: string;
      chapter: string;
    };
  };
  
export type AuthRootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: undefined;
};