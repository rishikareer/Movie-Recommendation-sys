import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated?: () => void;
}

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'War', 'Western'
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onPreferencesUpdated
}) => {
  const { profile, updateGenres } = useAuth();
  const [selected, setSelected] = useState<string[]>(profile.preferredGenres || ['Sci-Fi', 'Action']);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelected(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await updateGenres(selected);
    setSaving(false);
    if (onPreferencesUpdated) onPreferencesUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-white tracking-tight">Favorite Genres</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Choose genres to personalize your "For You" recommendation feed.
          </p>
        </div>

        {/* Genre Pill Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {ALL_GENRES.map(genre => {
            const isPicked = selected.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors text-center flex items-center justify-center gap-1.5 ${
                  isPicked
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {isPicked && <Check className="w-3 h-3 shrink-0" />}
                <span>{genre}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-900">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

      </div>
    </div>
  );
};
