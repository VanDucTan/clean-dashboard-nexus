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

interface ResultScreenProps {
  testScore: { correct: number; total: number };
  questions: Question[];
  answers: { [key: number]: Answer[] };
  selectedAnswers: { [key: number]: number };
  language: 'en' | 'vi';
  onRetake: () => void;
  onHome: () => void;
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

const ResultScreen: React.FC<ResultScreenProps> = ({
  testScore,
  questions,
  answers,
  selectedAnswers,
  language,
  onRetake,
  onHome
}) => {
  const t = translations[language];
  const isPassed = testScore.correct >= Math.ceil(testScore.total * 0.8);

  return (
    <Box sx={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '2rem',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Header */}
      <Box sx={{ 
        textAlign: 'center',
        mb: 4
      }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: isPassed ? 'success.main' : 'error.main',
          fontWeight: 'bold'
        }}>
          {t.testComplete}
        </Typography>

        <Typography variant="h5" sx={{ mb: 2 }}>
          {t.correctAnswers}: {testScore.correct} / {testScore.total}
        </Typography>

        <Typography variant="h5" sx={{ 
          color: isPassed ? 'success.main' : 'error.main',
          fontWeight: 'bold'
        }}>
          {isPassed ? t.passed : t.failed}
        </Typography>
      </Box>

      {/* Questions Review */}
      <Box sx={{ mb: 4 }}>
        {questions.map((question, index) => {
          const userAnswer = answers[question.id]?.find(a => a.id === selectedAnswers[question.id]);
          const correctAnswer = answers[question.id]?.find(a => a.is_correct);
          const isCorrect = userAnswer?.id === correctAnswer?.id;

          return (
            <Box
              key={question.id}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isCorrect ? 'success.light' : 'error.light',
                backgroundColor: isCorrect ? 'rgba(0, 200, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)',
              }}
            >
              {/* Question */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ minWidth: '30px' }}>
                  {index + 1}.
                </Typography>
                <Typography variant="h6">
                  {question.question}
                </Typography>
                <Typography sx={{ 
                  fontSize: '24px',
                  lineHeight: 1,
                  ml: 'auto'
                }}>
                  {isCorrect ? '✅' : '❌'}
                </Typography>
              </Box>

              {/* Answers */}
              <Box sx={{ pl: 5 }}>
                <Typography sx={{ 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <strong>{language === 'en' ? 'Your answer' : 'Câu trả lời của bạn'}:</strong>
                  {userAnswer?.text}
                </Typography>

                {!isCorrect && (
                  <Typography sx={{ 
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <strong>{language === 'en' ? 'Correct answer' : 'Câu trả lời đúng'}:</strong>
                    {correctAnswer?.text}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3,
        mt: 4 
      }}>
        {!isPassed && (
          <Button
            variant="contained"
            color="primary"
            onClick={onRetake}
            sx={{ 
              minWidth: '200px',
              py: 1.5
            }}
          >
            {t.retake}
          </Button>
        )}
        
        <Button
          variant="contained"
          color={isPassed ? "success" : "error"}
          onClick={onHome}
          sx={{ 
            minWidth: '200px',
            py: 1.5
          }}
        >
          {t.backToHome}
        </Button>
      </Box>
    </Box>
  );
};

const QuestionTestManagement: React.FC<QuestionTestManagementProps> = ({ language = 'en', testId }) => {
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
  const [hasStarted, setHasStarted] = useState(false);

  const fetchTypeId = async (name: string, team: string) => {
    try {
      const { data, error } = await supabase
        .from('question_type')
        .select('id')
        .eq('name', name)
        .eq('team', team)
        .single();

      if (error) throw error;
      return data?.id;
    } catch (error) {
      console.error('Error fetching type ID:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      if (testId) {
        // Format: {name}-{team}-{type_id}
        const parts = testId.split('-');
        if (parts.length >= 3) {
          const typeId = parts[parts.length - 1];
          if (typeId && !isNaN(Number(typeId))) {
            await fetchQuestions(parseInt(typeId));
          } else {
            toast.error('ID không hợp lệ');
          }
        }
      }
    };
    loadQuestions();
  }, [testId]);

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
      const { data: questions, error } = await supabase
        .from('question')
        .select('*')
        .eq('type_id', typeId);

      if (error) throw error;

      if (questions) {
        setQuestions(questions);
        await fetchAnswersForQuestions(questions);
      }
    } catch (error) {
      toast.error('Error fetching questions');
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

    // Format: {name}-{team}-{type_id}
    const parts = testId.split('-');
    if (parts.length < 3) {
      toast.error('Link không hợp lệ');
      return;
    }

    const typeId = parts[parts.length - 1];
    if (!typeId || isNaN(Number(typeId))) {
      toast.error('ID không hợp lệ');
      return;
    }

    const parsedTypeId = parseInt(typeId);
    const isAuthorized = await checkEmailAuthorization(email, parsedTypeId);
    if (!isAuthorized) {
      return;
    }

    setIsLoading(true);
    await fetchQuestions(parsedTypeId);
    setHasStarted(true);
    setIsLoading(false);
  };

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
      
      if (!email || !testId) {
        console.error('Missing required information:', { email, testId });
        toast.error(language === 'en' ? 'Missing required information' : 'Thiếu thông tin cần thiết');
        return false;
      }

      // Get type_id from testId (format: {name}-{team}-{type_id})
      const parts = testId.split('-');
      const type_id = parseInt(parts[parts.length - 1]);
      
      if (isNaN(type_id)) {
        console.error('Invalid type_id from testId:', testId);
        toast.error(language === 'en' ? 'Invalid test ID' : 'ID bài kiểm tra không hợp lệ');
        return false;
      }

      const currentDate = new Date().toISOString();

      // Prepare test history data
      const testData = {
        email: email.toLowerCase(),
        full_name: email.split('@')[0], // Basic name from email
        result,
        correct_answers: score.correct,
        total_questions: score.total,
        type_id,
        date_test: currentDate,
        created_at: currentDate,
        updated_at: currentDate
      };

      console.log('Saving test history:', testData);

      // Insert the test history
      const { data, error } = await supabase
        .from('test_history')
        .insert([testData])
        .select();

      if (error) {
        console.error('Database error:', error);
        toast.error(language === 'en' ? 'Failed to save results' : 'Không thể lưu kết quả');
        return false;
      }

      console.log('Saved test history:', data);
      toast.success(
        language === 'en' 
          ? 'Test results saved successfully' 
          : 'Đã lưu kết quả bài kiểm tra'
      );
      return true;
    } catch (error) {
      console.error('Error in saveTestHistory:', error);
      toast.error(
        language === 'en' 
          ? 'An error occurred while saving results' 
          : 'Đã xảy ra lỗi khi lưu kết quả'
      );
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
    setShowResults(true); // Immediately show the result screen

    const saved = await saveTestHistory(score);
    if (!saved) {
      toast.error('Failed to save test results');
    }
  };

  const handleRetake = () => {
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTestScore(null);
  };

  if (showResults && testScore) {
    return (
      <ResultScreen
        testScore={testScore}
        questions={questions}
        answers={answers}
        selectedAnswers={selectedAnswers}
        language={language}
        onRetake={handleRetake}
        onHome={() => navigate('/')}
      />
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

  if (!hasStarted) {
    return (
      <Box sx={{ p: 3 }}>
        <TextField
          fullWidth
          label={t.emailLabel}
          value={email}
          onChange={handleEmailChange}
          error={!isEmailValid || !!authError}
          helperText={!isEmailValid ? t.invalidEmail : authError}
          sx={{ 
            mb: 2,
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

  if (!questions || questions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" color="error">
          Không tìm thấy câu hỏi cho bài kiểm tra này
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t.backToHome}
        </Button>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" color="error">
          Có lỗi khi tải câu hỏi
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t.backToHome}
        </Button>
      </Box>
    );
  }

  const currentAnswers = answers[currentQuestion.id] || [];
  if (currentAnswers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" color="error">
          Không tìm thấy câu trả lời cho câu hỏi này
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t.backToHome}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
        {`${currentQuestionIndex + 1}/${questions.length}: ${currentQuestion.question}`}
      </Typography>
      <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
        <FormLabel component="legend" sx={{ color: 'text.secondary' }}>
          {language === 'en' ? 'Select your answer:' : 'Chọn câu trả lời:'}
        </FormLabel>
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
              sx={{ color: 'text.primary' }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Navigation and Submit */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 4,
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

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Show Submit button if all questions are answered */}
          {Object.keys(selectedAnswers).length === questions.length ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ 
                minWidth: '120px',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              {t.submit}
            </Button>
          ) : currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              disabled
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

      {/* Progress Indicator */}
      <Box sx={{ 
        mt: 3, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2 
      }}>
        <Typography color="text.secondary">
          {Object.keys(selectedAnswers).length} / {questions.length} {language === 'en' ? 'questions answered' : 'câu đã trả lời'}
        </Typography>
      </Box>
    </Box>
  );
};

export default QuestionTestManagement;