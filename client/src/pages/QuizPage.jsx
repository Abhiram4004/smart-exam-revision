import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuestionCard from '../components/QuestionCard';
import BookmarkButton from '../components/BookmarkButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { FiClock, FiArrowRight, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const count = parseInt(searchParams.get('count') || '10', 10);
  const timerSetting = searchParams.get('timer') !== '0';
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIndex]: selectedOptionIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Timer states
  const totalDuration = count * 60; // 60s per question
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const startTimeRef = useRef(Date.now());

  // Bookmarking state for current question
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/quiz?subject=${subjectId}&count=${count}`);
      if (!res.data.questions || res.data.questions.length === 0) {
        setError('No questions found for this subject. Please seed the database or add questions.');
        return;
      }
      setQuestions(res.data.questions);
      setCurrentIndex(0);
      setAnswers({});
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectId, count]);

  // Submit quiz function
  const submitQuiz = useCallback(async (forcedAnswers = answers) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);

      const formattedAnswers = questions.map((q, idx) => ({
        questionId: q._id,
        selectedIndex: forcedAnswers[idx] !== undefined ? forcedAnswers[idx] : -1
      }));

      const res = await api.post('/quiz/submit', {
        subject: subjectId,
        answers: formattedAnswers,
        durationSec
      });

      toast.success('Quiz submitted successfully!');
      navigate(`/quiz/result/${res.data.attempt._id}`, { replace: true });
    } catch (err) {
      toast.error('Failed to submit quiz results.');
      setSubmitting(false);
    }
  }, [submitting, questions, answers, subjectId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!timerSetting || loading || submitting || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast('Time has expired! Submitting your quiz now...', { icon: '⏰' });
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerSetting, loading, submitting, questions.length, submitQuiz]);

  // Bookmark check
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    api.get('/bookmarks?type=question')
      .then((res) => {
        const bms = res.data.bookmarks || [];
        setIsBookmarked(bms.some((b) => b.refId === currentQ._id));
      })
      .catch(() => {});
  }, [questions, currentIndex]);

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleToggleBookmark = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    try {
      setBookmarkLoading(true);
      const res = await api.post('/bookmarks/toggle', {
        type: 'question',
        refId: currentQ._id
      });
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Question bookmarked!' : 'Bookmark removed.');
    } catch (err) {
      toast.error('Failed to toggle bookmark.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleNextOrSubmit = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitQuiz();
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Generating quiz questions..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchQuestions} />;
  }

  const currentQ = questions[currentIndex];
  const isSelected = answers[currentIndex] !== undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-6 animate-fade-in">
      {/* Top Controls: Question counter, Timer, Bookmark */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Question
          </span>
          <span className="text-base font-extrabold text-primary-600 dark:text-primary-400">
            {currentIndex + 1}
          </span>
          <span className="text-xs text-gray-400">
            / {questions.length}
          </span>
        </div>

        {timerSetting && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
            timeLeft < 60
              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-pulse'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}>
            <FiClock className="w-4 h-4" />
            <span>{formattedTime}</span>
          </div>
        )}

        <BookmarkButton
          isBookmarked={isBookmarked}
          onToggle={handleToggleBookmark}
          loading={bookmarkLoading}
        />
      </div>

      {/* Progress Track */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      {currentQ && (
        <QuestionCard
          questionText={currentQ.questionText}
          options={currentQ.options}
          selectedIndex={answers[currentIndex]}
          onSelectOption={handleSelectOption}
          topic={currentQ.topic}
        />
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          disabled={currentIndex === 0 || submitting}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px]"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!isSelected || submitting}
          onClick={handleNextOrSubmit}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] ${
            isLastQuestion
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {submitting ? (
            <span>Submitting...</span>
          ) : isLastQuestion ? (
            <>
              <FiCheck className="w-4 h-4" />
              <span>Submit Quiz</span>
            </>
          ) : (
            <>
              <span>Next Question</span>
              <FiArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

