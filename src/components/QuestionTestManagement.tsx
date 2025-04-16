import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Button,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { toast } from 'react-toastify';

const supabase = createClient(
  'https://dyrhsseymnlqjyhwjgag.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cmhzc2V5bW5scWp5aHdqZ2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODk3NDQsImV4cCI6MjA1OTE2NTc0NH0.uaTdmKfMw8gWk25fA85oFWQzXkHCf7d0c0DXpNxx4V8'
);

interface QuestionTestManagementProps {
  language?: 'en' | 'vi';
  testId?: string;
  startWithQuestions?: boolean;
}

interface QuestionType {
  id: number;
  name: string;
  title: string;
}

interface Question {
  id: number;
  question: string;
  level: number;
  type_id: number;
}

interface Answer {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
}

interface TestHistory {
  id: number;
  date_test: string;
  email: string;
  full_name: string;
  result: string;
  correct_answers: number;
  total_questions: number;
  assessment_type: string;
}

const translations = {
  en: {
    emailLabel: 'Email',
    fullNameLabel: 'Full Name',
    startTest: 'Start Test',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    loading: 'Loading...',
    invalidEmail: 'Please enter a valid email',
    testComplete: 'Test Complete',
    correctAnswers: 'Correct Answers',
    totalQuestions: 'Total Questions',
    result: 'Result',
    passed: 'Congratulations! You passed the test!',
    failed: 'Sorry, you did not pass the test.',
    retake: 'Retake Test',
    backToHome: 'Back to Home',
    selectAnswer: 'Please select your answer',
  },
  vi: {
    emailLabel: 'Email',
    fullNameLabel: 'Họ và tên',
    startTest: 'Bắt đầu',
    next: 'Tiếp theo',
    previous: 'Quay lại',
    submit: 'Nộp bài',
    loading: 'Đang tải...',
    invalidEmail: 'Vui lòng nhập email hợp lệ',
    testComplete: 'Kết quả bài kiểm tra',
    correctAnswers: 'Số câu đúng',
    totalQuestions: 'Tổng số câu hỏi',
    result: 'Kết quả',
    passed: 'Chúc mừng! Bạn đã vượt qua bài kiểm tra!',
    failed: 'Rất tiếc, bạn chưa vượt qua bài kiểm tra.',
    retake: 'Làm lại bài kiểm tra',
    backToHome: 'Quay về trang chủ',
    selectAnswer: 'Vui lòng chọn câu trả lời',
  },
};

const QuestionTestManagement: React.FC<QuestionTestManagementProps> = ({ 
  language = 'en', 
  testId,
  startWithQuestions = false 
}) => {
  const navigate = useNavigate();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: Answer[] }>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [testScore, setTestScore] = useState<{ correct: number; total: number } | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (testId) {
      const [typeId] = testId.split('-');
      if (typeId) {
        const savedEmail = localStorage.getItem('testUserEmail');
        if (startWithQuestions) {
          if (savedEmail) {
            setEmail(savedEmail);
            setIsEmailValid(true);
            fetchQuestions(parseInt(typeId));
          } else {
            // If no email is saved but we're on the questions page, redirect back to email input
            navigate(`/test/${testId}`);
          }
        }
      }
    }
  }, [testId, startWithQuestions, navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
    setAuthError(null); // Clear error when email changes
  };

  const fetchQuestions = async (typeId: number) => {
    try {
      const { data: questionsData, error } = await supabase
        .from('question')
        .select('*')
        .eq('type_id', typeId);

      if (error) throw error;

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData);
        await fetchAnswersForQuestions(questionsData);
        return true;
      } else {
        toast.error('Không có câu hỏi nào cho bài kiểm tra này');
        return false;
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Lỗi khi tải câu hỏi');
      return false;
    }
  };

  const fetchAnswersForQuestions = async (questions: Question[]) => {
    try {
      const questionIds = questions.map(q => q.id);
      const { data: answers, error } = await supabase
        .from('answer')
        .select('*')
        .in('question_id', questionIds);

      if (error) throw error;

      if (answers) {
        const answersMap: { [key: number]: Answer[] } = {};
        answers.forEach((answer: Answer) => {
          if (!answersMap[answer.question_id]) {
            answersMap[answer.question_id] = [];
          }
          answersMap[answer.question_id].push(answer);
        });
        setAnswers(answersMap);
      }
    } catch (error) {
      toast.error('Error fetching answers');
    }
  };

  const checkEmailAuthorization = async (email: string, questionTypeId: number) => {
    try {
      setIsValidatingEmail(true);
      setAuthError(null);

      const { data: ruleAssessment, error: ruleError } = await supabase
        .from('rule_assessment')
        .select('*')
        .eq('email', email.toLowerCase());

      if (ruleError) throw ruleError;

      const isAllowed = ruleAssessment && ruleAssessment.length > 0;
      setIsAuthorized(isAllowed);
      
      if (!isAllowed) {
        setAuthError('Bạn chưa vượt qua vòng phỏng vấn để làm bài kiểm tra.');
      }
      
      return isAllowed;
    } catch (error) {
      console.error('Error checking authorization:', error);
      setAuthError('Có lỗi xảy ra khi kiểm tra quyền truy cập');
      return false;
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleStartTest = async () => {
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }

    if (!testId) {
      toast.error('Không tìm thấy bài kiểm tra');
      return;
    }

    setIsLoading(true);
    const [typeId] = testId.split('-');
    const isAuthorized = await checkEmailAuthorization(email, parseInt(typeId));
    
    if (!isAuthorized) {
      setIsLoading(false);
      return;
    }

    // Save email to localStorage for persistence
    localStorage.setItem('testUserEmail', email);
    
    // Fetch questions before navigation
    await fetchQuestions(parseInt(typeId));
    
    // Only navigate if questions were fetched successfully
    if (questions.length > 0) {
      navigate(`/test/${testId}/questions`);
    } else {
      toast.error('Không thể tải câu hỏi. Vui lòng thử lại.');
    }
    
    setIsLoading(false);
  };

  // Add useEffect to check for saved email and authorization on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('testUserEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsEmailValid(true);
    }
  }, []);

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = (): { correct: number; total: number } => {
    let correctCount = 0;
    questions.forEach(question => {
      const selectedAnswerId = selectedAnswers[question.id];
      const correctAnswer = answers[question.id]?.find(a => a.is_correct);
      if (correctAnswer && selectedAnswerId === correctAnswer.id) {
        correctCount++;
      }
    });
    return { correct: correctCount, total: questions.length };
  };

  const saveTestHistory = async (score: { correct: number; total: number }) => {
    try {
      const result = score.correct >= score.total * 0.8 ? 'passed' : 'failed';
      
      if (!email) {
        toast.error('Missing required information');
        return false;
      }

      const { data, error } = await supabase
        .from('test_history')
        .insert({
          email,
          result,
          correct_answers: score.correct,
          total_questions: score.total,
          assessment_type: 'Custom',
          date_test: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Error saving test history:', error);
        toast.error(error.message || 'Error saving test results');
        return false;
      }

      toast.success('Test results saved successfully');
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred while saving test results');
      return false;
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !selectedAnswers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast.error(t.selectAnswer);
      return;
    }

    const score = calculateScore();
    setTestScore(score);
    const saved = await saveTestHistory(score);
    if (saved) {
      setShowResults(true);
    }
  };

  const handleRetake = () => {
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTestScore(null);
  };

  if (showResults && testScore) {
    const isPassed = testScore.correct === testScore.total;
    const resultStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center' as const,
    };

    return (
      <Box sx={resultStyle}>
        <Typography variant="h4" gutterBottom sx={{ color: isPassed ? 'success.main' : 'error.main' }}>
          {t.testComplete}
        </Typography>
        
        <Typography variant="h6">
          {t.correctAnswers}: {testScore.correct}
        </Typography>
        
        <Typography variant="h6">
          {t.totalQuestions}: {testScore.total}
        </Typography>
        
        <Typography variant="h5" sx={{ 
          color: isPassed ? 'success.main' : 'error.main',
          fontWeight: 'bold',
          my: 2 
        }}>
          {isPassed ? t.passed : t.failed}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {!isPassed && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetake}
              sx={{ minWidth: '150px' }}
            >
              {t.retake}
            </Button>
          )}
          
          <Button
            variant="contained"
            color={isPassed ? "success" : "error"}
            onClick={() => navigate('/')}
            sx={{ minWidth: '150px' }}
          >
            {t.backToHome}
          </Button>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t.loading}</Typography>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <TextField
          fullWidth
          label={t.emailLabel}
          value={email}
          onChange={handleEmailChange}
          error={!isEmailValid || !!authError}
          helperText={!isEmailValid ? t.invalidEmail : authError}
          sx={{ 
            '& .MuiFormHelperText-root': {
              color: '#dc2626',
              fontWeight: 500
            }
          }}
          disabled={isValidatingEmail}
        />
        <Button
          variant="contained"
          onClick={handleStartTest}
          disabled={!isEmailValid || !email || isValidatingEmail}
          fullWidth
          sx={{
            height: '48px',
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          {isValidatingEmail ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t.startTest
          )}
        </Button>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = answers[currentQuestion.id] || [];

  return (
    <Box sx={{ 
      p: 3,
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
        {`Câu ${currentQuestionIndex + 1}/${questions.length}`}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
        {currentQuestion.question}
      </Typography>
      <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
        <RadioGroup
          value={selectedAnswers[currentQuestion.id] || ''}
          onChange={(e) => handleAnswerSelect(currentQuestion.id, Number(e.target.value))}
        >
          {currentAnswers.map((answer) => (
            <FormControlLabel
              key={answer.id}
              value={answer.id}
              control={<Radio />}
              label={answer.text}
              sx={{
                mb: 1,
                p: 1,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 3,
        gap: 2
      }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          sx={{ minWidth: '120px' }}
        >
          {t.previous}
        </Button>
        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ minWidth: '120px' }}
          >
            {t.submit}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ minWidth: '120px' }}
          >
            {t.next}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuestionTestManagement;