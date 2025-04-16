import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import QuestionTestManagement from '@/components/QuestionTestManagement';

const Test = () => {
  const { id } = useParams();
  const location = useLocation();
  const isQuestionsPage = location.pathname.includes('/questions');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex flex-col items-center space-y-6 mb-8">
          {/* Logo */}
          <div className="w-20 h-20">
            <img 
              src="/logo.png" 
              alt="NhiLe TEAM" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Brand name */}
          <div className="text-2xl font-semibold text-gray-800">
            Nhi<span className="text-gray-500">Le</span>TEAM
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900">
            BÀI KIỂM TRA NỘI QUY VÀ VĂN HÓA
          </h1>
        </div>

        {/* Test content */}
        <div className={`bg-gray-50 p-6 rounded-lg shadow-sm ${isQuestionsPage ? 'max-w-4xl mx-auto' : ''}`}>
          <QuestionTestManagement 
            testId={id} 
            language="vi"
            startWithQuestions={isQuestionsPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Test; 