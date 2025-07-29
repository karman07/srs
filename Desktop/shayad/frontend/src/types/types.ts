export enum ExamType {
  SPEED = 'speed',
  ACCURACY_ABACUS = 'accuracy-abacus',
  ACCURACY_MENTALLY = 'accuracy-mentally',
}

export interface ExamData {
  [key: string]: {
    Total: number;
    [sectionKey: string]: {
      Digit?: number;
      Rows?: number;
      Questions: number;
      multiplication?: boolean;
      division?: boolean;
      Multi1?: number;
      Multi2?: number;
      Div1?: number;
      Div2?: number;
    } | number;
  };
}

export interface ExamResult {
  name: string;
  type: string;
  level: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
  timeSpent: number;
}

export interface QuestionData {
  numbers: number[];
  answer: number;
  type: 'addition' | 'multiplication' | 'division';
  number1?: number;
  number2?: number;
}



export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  MainTabs: undefined;
  Previous: undefined;
  ExamDetails: { 
    type: ExamType; 
    level: string;
  };
  ExamInstructions: { type: string; level: string };
  Exam: { type: string; level: string };
  Results: { result: ExamResult };
};
