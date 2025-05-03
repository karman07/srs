import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from './base/Base';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './theme/ThemeContext'; // Assuming ThemeContext is already created

const TeacherList = () => {
  const { darkMode } = useTheme();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const extractSubject = (name) => {
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : 'Unknown';
  };

  const fetchTeachers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const reviewed = JSON.parse(localStorage.getItem('reviewedTeachers')) || [];

      if (!user?.branch || !user?.semester) {
        console.error('Branch or Semester not found in user object');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/teachers`, {
        params: { branch: user.branch, semester: user.semester },
      });

      const unreviewed = response.data
        .filter(t => !reviewed.includes(t._id))
        .map(t => ({
          ...t,
          subject: extractSubject(t.name)
        }));

      setTeachers(unreviewed);
      setFilteredTeachers(unreviewed);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = teachers.filter((t) =>
      t.name.toLowerCase().includes(value)
    );
    setFilteredTeachers(filtered);
  };

  const handleTeacherClick = (teacher) => {
    const subject = extractSubject(teacher.name);
    navigate(`/review/${teacher._id}`, { state: { subject: subject } });
  };


  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className={`max-w-4xl mx-auto rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <h1 className={`text-3xl font-bold text-center ${darkMode ? 'text-green-300' : 'text-green-800'} mb-6`}>
          Your Teachers
        </h1>

        <input
          type="text"
          placeholder="Search Teachers..."
          value={searchTerm}
          onChange={handleSearch}
          className={`w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'border-green-500 bg-gray-700 text-white focus:ring-green-600' : 'border-green-700 text-black focus:ring-green-600'}`}
        />

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500"></div>
          </div>
        ) : filteredTeachers.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeachers.map((teacher) => (
              <li
                key={teacher._id}
                onClick={() => handleTeacherClick(teacher)}
                className={`cursor-pointer border p-4 rounded-lg transition-shadow ${darkMode ? 'bg-gray-800 border-green-500 text-white hover:shadow-lg' : 'bg-white border-green-700 text-black hover:shadow-lg'}`}
              >
                <p className="text-lg font-semibold">{teacher.name}</p>
                <p className="text-sm text-gray-500">Id: {teacher._id}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No teachers found.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherList;
