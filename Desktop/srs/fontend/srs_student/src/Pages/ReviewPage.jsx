import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BASE_URL } from '@/base/Base';
import { useTheme } from '@/theme/ThemeContext'; // Import the useTheme hook

const ReviewPage = () => {
  const { teacherId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // Access darkMode from context

  const [questions, setQuestions] = useState([]);
  const [ratings, setRatings] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const subject = location.state?.subject || 'Unknown';

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/questions`);
        setQuestions(response.data);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleRatingChange = (questionId, rating) => {
    setRatings(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmitReview = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        console.error('User data not found');
        return;
      }

      const reviewData = {
        studentId: user._id,
        teacherId,
        subject,
        branch: user.branch,
        ratings: Object.entries(ratings).map(([questionId, rating]) => ({
          questionId,
          rating,
        })),
        overallFeedback,
      };

      await axios.post(`${BASE_URL}/reviews`, reviewData);

      const reviewed = JSON.parse(localStorage.getItem('reviewedTeachers')) || [];
      localStorage.setItem('reviewedTeachers', JSON.stringify([...new Set([...reviewed, teacherId])]));

      navigate('/');
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className={`max-w-4xl mx-auto bg-white ${darkMode ? 'dark:bg-gray-800' : ''} rounded-xl shadow-lg p-8`}>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500"></div>
          </div>
        ) : (
          <div>
            {questions.map((question) => (
              <div key={question._id} className="mb-8">
                <p className={`text-xl font-semibold  ${darkMode ? 'text-green-300' : 'text-green-800'} mb-3`}>{question.text}</p>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      onClick={() => handleRatingChange(question._id, star)}
                      className={`w-8 h-8 cursor-pointer transition-colors ${ratings[question._id] >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .587l3.668 7.431 8.2 1.18-5.9 5.74 1.4 8.158L12 18.897l-7.368 3.19 1.4-8.158-5.9-5.74 8.2-1.18L12 .587z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}

            <textarea
              className={`w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
              placeholder="Any overall feedback?"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
            ></textarea>

            <div className="flex justify-center mt-8">
              <button
                className={`px-6 py-3 rounded-md text-white font-semibold ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-800 hover:bg-green-900'}`}
                onClick={handleSubmitReview}
              >
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
