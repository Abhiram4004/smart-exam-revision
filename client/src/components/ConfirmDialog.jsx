import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isDanger ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
        }`}>
          <FiAlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
          {message}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
        >
          {cancelText}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm active:scale-95 min-h-[44px] ${
            isDanger
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}

