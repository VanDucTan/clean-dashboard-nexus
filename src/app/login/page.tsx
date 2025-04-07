'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdError } from 'react-icons/md';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(''); // Reset error message

    const { error, success } = await login(email, password);
    
    if (!success && error) {
      setPasswordError(error);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B2028]">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Đăng nhập vào hệ thống
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Vui lòng đăng nhập để tiếp tục
        </p>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-white mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              id="email"
              className="w-full p-3 rounded bg-[#1B2028] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name.nlt@gmail.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`w-full p-3 rounded bg-[#1B2028] border ${
                  passwordError ? 'border-red-500' : 'border-gray-700'
                } text-white focus:outline-none focus:border-blue-500`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordError && (
              <div className="flex items-center gap-2 mt-2 text-red-500">
                <MdError size={20} />
                <span className="text-sm">{passwordError}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="mr-2"
              />
              <label htmlFor="remember" className="text-gray-400">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a href="#" className="text-blue-500 hover:text-blue-600">
              Quên mật khẩu?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
} 