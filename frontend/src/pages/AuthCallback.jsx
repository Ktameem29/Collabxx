import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      toast.error('Sign-in failed. Please try again.');
      navigate('/login');
      return;
    }

    localStorage.setItem('token', token);

    authAPI.getMe()
      .then(({ data }) => {
        loginWithToken(token, data);
        toast.success('Signed in with Google!');
        navigate('/dashboard');
      })
      .catch(() => {
        localStorage.removeItem('token');
        toast.error('Authentication failed.');
        navigate('/login');
      });
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}
