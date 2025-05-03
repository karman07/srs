import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from '@/assets/thapar_logo.jpeg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { BASE_URL } from "@/base/Base";
import { useTheme } from "@/theme/ThemeContext"; // Import the useTheme hook

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // Access darkMode from context

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      navigate('/');  
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${darkMode ? 'from-gray-800 via-gray-800 to-gray-900' : 'from-white via-white to-green-200'}`}>
      <Card className={`w-full max-w-md p-6 shadow-2xl border ${darkMode ? 'dark:bg-gray-800' : 'border-green-900'} rounded-2xl transform transition-all hover:scale-105 hover:shadow-green-500/50 duration-300 animate__animated animate__fadeIn`}>
        <CardHeader className="flex flex-col items-center space-y-4">
          <img 
            src={Logo} 
            alt="Logo" 
            className="w-20 h-20 object-contain animate__animated animate__zoomIn" 
          />
          <CardTitle className="text-3xl font-extrabold text-center text-green-800 dark:text-green-300 animate__animated animate__fadeInUp">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form 
            onSubmit={handleLogin}
            className="space-y-6 animate__animated animate__fadeInUp animate__delay-1s"
          >
            <div className="grid gap-2">
              <Input 
                id="email" 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                className="p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-all duration-300"
                style={{ borderColor: darkMode ? 'gray' : 'green' }} 
                required 
              />
            </div>

            <div className="grid gap-2">
              <Input 
                id="password" 
                type="password" 
                name="password" 
                placeholder="Enter your password" 
                className="p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-all duration-300"
                style={{ borderColor: darkMode ? 'gray' : 'green' }} 
                required 
              />
            </div>

            <div className="flex items-center space-x-2">
              <input 
                id="remember" 
                type="checkbox" 
                className="accent-green-800 transform transition-all duration-300" 
              />
              <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                Remember me
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-3 bg-green-800 text-white rounded-md shadow-md hover:bg-green-900 focus:outline-none transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <a 
                  href="http://147.93.27.245:8005/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 font-semibold hover:underline hover:text-green-900 transition-colors duration-300"
                >
                  Register
                </a>
              </p>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
