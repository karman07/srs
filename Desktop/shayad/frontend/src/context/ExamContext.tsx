import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { ExamData, ExamResult } from '../types/types';
import { storeData, getData } from '../utils/storage';
import api from '../utils/api';

interface ExamContextType {
  userName: string;
  setUserName: (name: string) => void;

  examData: ExamData | null;
  setExamData: (data: ExamData) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;

  currentExamType: string;
  setCurrentExamType: (type: string) => void;
  currentLevel: string;
  setCurrentLevel: (level: string) => void;

  correctAnswers: number;
  wrongAnswers: number;
  incrementCorrect: () => void;
  incrementWrong: () => void;
  resetScores: () => void;

  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  examStartTime: number;
  setExamStartTime: (time: number) => void;

  examResult: ExamResult | null;
  setExamResult: (result: ExamResult) => void;

  isExamActive: boolean;
  setIsExamActive: (active: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;

  fetchExamData: (params: { type: string; level: string }) => Promise<void>;
  submitResults: (result: ExamResult) => Promise<void>;

  totalQuestions: number;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentExamType, setCurrentExamType] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 min
  const [examStartTime, setExamStartTime] = useState(0);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0); // ✅ Added

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const savedName = await getData('userName');
    if (savedName) {
      setUserName(savedName);
    }
  };

  const handleSetUserName = async (name: string) => {
    setUserName(name);
    await storeData('userName', name);
  };

  const incrementCorrect = () => setCorrectAnswers((prev) => prev + 1);
  const incrementWrong = () => setWrongAnswers((prev) => prev + 1);

  const resetScores = () => {
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTimeRemaining(15 * 60);
    setCurrentPage(1);
    setIsExamActive(false);
  };

  const fetchExamData = async ({ type, level }: { type: string; level: string }) => {
    setLoading(true);
    try {
      const response = await api.get(`/${type}/level${level}`); // Example: /speed/level1
      const fetchedData: ExamData = {
        [level]: response.data,
      };
      setExamData(fetchedData);
      setCurrentExamType(type);
      setCurrentLevel(level);

      // ✅ Extract and store total questions from API respons
      console.log(response.data?.data?.Total, 'Total Questions from API');
      const total = response.data?.data?.Total;
      setTotalQuestions(total);

      console.log('Fetched exam data:', fetchedData);
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitResults = async (result: ExamResult) => {
    try {
      console.log('Submitting results:', result);
      setExamResult(result);
      await storeData('lastExamResult', result);

      await api.post('/result', result);
    } catch (error) {
      console.error('Error submitting results:', error);
    }
  };

  const value: ExamContextType = {
    userName,
    setUserName: handleSetUserName,
    examData,
    setExamData,
    loading,
    setLoading,
    currentExamType,
    setCurrentExamType,
    currentLevel,
    setCurrentLevel,
    correctAnswers,
    wrongAnswers,
    incrementCorrect,
    incrementWrong,
    resetScores,
    timeRemaining,
    setTimeRemaining,
    examStartTime,
    setExamStartTime,
    examResult,
    setExamResult,
    isExamActive,
    setIsExamActive,
    currentPage,
    setCurrentPage,
    fetchExamData,
    submitResults,
    totalQuestions, // ✅ included in context
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};
