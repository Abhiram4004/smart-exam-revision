import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DeckCard from '../components/DeckCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { FiPlus, FiUpload, FiFilter, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSubject = searchParams.get('subject') || '';

  const [decks, setDecks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [deckSubject, setDeckSubject] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete state
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // File import ref
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedSubject ? `/decks?subject=${selectedSubject}` : '/decks';
      const [deckRes, subjRes] = await Promise.all([
        api.get(url),
        api.get('/subjects')
      ]);
      setDecks(deckRes.data.decks || []);
      setSubjects(subjRes.data.subjects || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch flashcard decks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSubject]);

  const handleSubjectFilterChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ subject: val });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!deckName || !deckSubject) {
      toast.error('Deck name and subject are required.');
      return;
    }

    try {
      setCreating(true);
      const res = await api.post('/decks', {
        name: deckName,
        description: deckDesc,
        subject: deckSubject
      });
      toast.success('Deck created successfully!');
      setDecks([res.data.deck, ...decks]);
      setCreateModalOpen(false);
      setDeckName('');
      setDeckDesc('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create deck.');
    } finally {
      setCreating(false);
    }
  };

  const handleExportDeck = async (deck) => {
    try {
      const res = await api.get(`/import-export/export/deck/${deck._id}`);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${deck.name.replace(/\s+/g, '_')}_export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Deck exported as JSON file!');
    } catch (err) {
      toast.error('Failed to export deck.');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.deck || !json.cards) {
          toast.error('Invalid deck format. File must contain "deck" and "cards".');
          return;
        }

        const res = await api.post('/import-export/import/deck', {
          deck: json.deck,
          cards: json.cards
        });
        toast.success(`Imported deck "${res.data.deck.name}" with ${res.data.importedCardCount} cards!`);
        fetchData();
      } catch (err) {
        toast.error('Failed to parse or import deck JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/decks/${deckToDelete._id}`);
      toast.success('Deck deleted.');
      setDecks(decks.filter((d) => d._id !== deckToDelete._id));
      setDeckToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete deck.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <FiLayers className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span>Revision Flashcards</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse decks, flip cards with 3D animation, and master topics with spaced repetition
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm min-h-[44px]"
            title="Import deck from JSON file"
          >
            <FiUpload className="w-4 h-4" /> Import Deck
          </button>
          <button
            onClick={() => {
              setDeckSubject(selectedSubject || (subjects[0]?._id || ''));
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 min-h-[44px]"
          >
            <FiPlus className="w-4 h-4" /> Create Deck
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <FiFilter className="w-4 h-4 text-gray-400 ml-2" />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Filter Subject:</span>
        <select
          value={selectedSubject}
          onChange={handleSubjectFilterChange}
          className="text-xs sm:text-sm py-1.5 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading decks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : decks.length === 0 ? (
        <EmptyState
          title="No Flashcard Decks Found"
          description="Create your own deck or switch subjects to discover revision content."
          actionLabel="Create First Deck"
          onAction={() => {
            setDeckSubject(subjects[0]?._id || '');
            setCreateModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map((deck) => (
            <DeckCard
              key={deck._id}
              deck={deck}
              isOwner={deck.owner?._id === user?._id || deck.owner === user?._id}
              onExport={handleExportDeck}
              onDelete={(d) => setDeckToDelete(d)}
            />
          ))}
        </div>
      )}

      {/* Create Deck Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Flashcard Deck"
      >
        <form onSubmit={handleCreateDeck} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Deck Name *
            </label>
            <input
              type="text"
              required
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g. JavaScript Async Mastery"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <select
              required
              value={deckSubject}
              onChange={(e) => setDeckSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
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
              Description (Optional)
            </label>
            <textarea
              rows="3"
              value={deckDesc}
              onChange={(e) => setDeckDesc(e.target.value)}
              placeholder="What syllabus concepts does this deck cover?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Deck'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deckToDelete}
        title="Delete Flashcard Deck"
        message={`Are you sure you want to delete "${deckToDelete?.name}" and all its flashcards? This action cannot be undone.`}
        confirmText="Delete Deck"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteDeck}
        onCancel={() => setDeckToDelete(null)}
      />
    </div>
  );
}

