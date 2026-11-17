import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📚');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/subjects');
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setDescription('');
    setIcon('📚');
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSubject(s);
    setName(s.name);
    setDescription(s.description || '');
    setIcon(s.icon || '📚');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Subject name is required.');
      return;
    }

    try {
      setSaving(true);
      if (editingSubject) {
        const res = await api.put(`/subjects/${editingSubject._id}`, { name, description, icon });
        toast.success('Subject updated successfully!');
        setSubjects(subjects.map((s) => (s._id === editingSubject._id ? res.data.subject : s)));
      } else {
        const res = await api.post('/subjects', { name, description, icon });
        toast.success('Subject created successfully!');
        setSubjects([...subjects, res.data.subject]);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/subjects/${subjectToDelete._id}`);
      toast.success('Subject and its questions/cards deleted.');
      setSubjects(subjects.filter((s) => s._id !== subjectToDelete._id));
      setSubjectToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete subject.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading subject catalog..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSubjects} />;
  }

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
          <FiPlus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Manage Course Subjects
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add or edit course modules, configure subject icons, and inspect card/question statistics.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-750 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Flashcards</th>
                <th className="px-6 py-4 text-center">Questions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {subjects.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">{s.icon || '📚'}</span>
                    <span>{s.name}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {s.description || '—'}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {s.cardCount || 0}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {s.questionCount || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(s)}
                        aria-label="Edit subject"
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSubjectToDelete(s)}
                        aria-label="Delete subject"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-3">
            <div className="w-20">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Icon
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 text-center text-xl rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of syllabus topics covered in this module..."
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
              {saving ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Subject Dialog */}
      <ConfirmDialog
        isOpen={!!subjectToDelete}
        title="Delete Subject?"
        message={`Are you sure you want to delete "${subjectToDelete?.name}"? All associated flashcards and question bank MCQs will also be deleted.`}
        confirmText="Delete Subject"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
}

