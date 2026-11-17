import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiShield, FiCalendar, FiEdit2, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveName = () => {
    if (!name.trim()) {
      toast.error('Name cannot be blank.');
      return;
    }
    updateUser({ ...user, name });
    setIsEditing(false);
    toast.success('Profile name updated!');
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal details and university course profile.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-extrabold text-3xl shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3 py-1.5 text-base font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleSaveName}
                    aria-label="Save name"
                    className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    aria-label="Edit name"
                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                user?.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300'
              }`}>
                <FiShield className="w-3 h-3" />
                <span className="capitalize">{user?.role || 'student'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-750">
            <FiMail className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Registered Email</span>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user?.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-750">
            <FiCalendar className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Account Created</span>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{joinedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

