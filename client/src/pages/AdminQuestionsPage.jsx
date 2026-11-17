import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiFilter, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('medium');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/admin/questions?page=${page}&limit=10`;
      if (selectedSubject) url += `&subject=${selectedSubject}`;
      const res = await api.get(url);
      setQuestions(res.data.questions || []);
      setPagination(res.data.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch question bank.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, page]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormSubject(selectedSubject || (subjects[0]?._id || ''));
    setFormTopic('');
    setFormQuestionText('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormDifficulty('medium');
    setModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormSubject(q.subject?._id || q.subject);
    setFormTopic(q.topic || '');
    setFormQuestionText(q.questionText);
    setFormOptions(q.options?.length >= 2 ? [...q.options] : ['', '', '', '']);
    setFormCorrectIndex(q.correctIndex || 0);
    setFormExplanation(q.explanation || '');
    setFormDifficulty(q.difficulty || 'medium');
    setModalOpen(true);
  };

  const handleOptionChange = (idx, value) => {
    const next = [...formOptions];
    next[idx] = value;
    setFormOptions(next);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formSubject || !formQuestionText.trim()) {
      toast.error('Subject and question text are required.');
      return;
    }

    const validOptions = formOptions.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('At least 2 options are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        subject: formSubject,
        topic: formTopic,
        questionText: formQuestionText,
        options: validOptions,
        correctIndex: formCorrectIndex,
        explanation: formExplanation,
        difficulty: formDifficulty
      };

      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion._id}`, payload);
        toast.success('Question updated successfully!');
      } else {
        await api.post('/admin/questions', payload);
        toast.success('Question added to question bank!');
      }

      setModalOpen(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/questions/${questionToDelete._id}`);
      toast.success('Question deleted.');
      setQuestions(questions.filter((q) => q._id !== questionToDelete._id));
      setQuestionToDelete(null);
    } catch (err) {
      toast.error('Failed to delete question.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Admin Portal</span>
        </Link>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all min-h-[44px]"
        >
          <FiPlus className="w-4 h-4" /> Add MCQ Question
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Question Bank Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review, create, and maintain the multiple-choice questions used in exam simulations.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <FiFilter className="w-4 h-4 text-gray-400 ml-2" />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Filter Subject:</span>
        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setPage(1);
          }}
          className="text-xs sm:text-sm py-1.5 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Questions list / table */}
      {loading ? (
        <LoadingSpinner message="Loading question bank items..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchQuestions} />
      ) : questions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-500">
          No questions found for the selected subject filter.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    {q.subject?.name || 'Subject'}
                  </span>
                  {q.topic && (
                    <span className="text-xs text-gray-400">
                      • {q.topic}
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {q.difficulty || 'medium'}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(q)}
                    aria-label="Edit question"
                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuestionToDelete(q)}
                    aria-label="Delete question"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                {q.questionText}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options?.map((opt, optIdx) => {
                  const isCorrect = q.correctIndex === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 font-bold text-emerald-900 dark:text-emerald-200'
                          : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-[10px]">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="truncate">{opt}</span>
                      {isCorrect && <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 p-2.5 rounded-xl">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Explanation: </span>
                  {q.explanation}
                </p>
              )}
            </div>
          ))}

          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add MCQ Question'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Subject *
              </label>
              <select
                required
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary-500"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Topic Tag
              </label>
              <input
                type="text"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                placeholder="e.g. Memory Management"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Question Text *
            </label>
            <textarea
              required
              rows="3"
              value={formQuestionText}
              onChange={(e) => setFormQuestionText(e.target.value)}
              placeholder="Enter exam question..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
              Answer Options & Select Correct (A-D) *
            </label>
            <div className="space-y-2">
              {formOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCorrectIndex(idx)}
                    title="Mark this option as correct"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      formCorrectIndex === idx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>
                  <input
                    type="text"
                    required={idx < 2}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {formCorrectIndex === idx && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ✓ Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Explanation for Solution
            </label>
            <textarea
              rows="3"
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              placeholder="Why is this option correct? (Shown on quiz result review)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-md active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!questionToDelete}
        title="Delete Question?"
        message="Are you sure you want to permanently delete this multiple-choice question from the question bank?"
        confirmText="Delete Question"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
}

