import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'edu_helper_search_history';
const MAX_HISTORY = 10;

/**
 * Generates a human-readable label for a search entry.
 */
const buildLabel = (data) => {
  const parts = [];
  if (data.intended_major) parts.push(data.intended_major);
  if (data.degree_applying_for) parts.push(data.degree_applying_for);
  if (!parts.length) parts.push('General Search');
  return parts.join(' · ');
};

/**
 * useSearchHistory — persists search form inputs to localStorage.
 *
 * Returns:
 *   localHistory  — array of { id, label, timestamp, data } objects (newest first)
 *   saveToHistory — call this with form data after a successful search
 *   removeFromHistory — call this with an id to delete a single entry
 *   clearHistory  — wipe all local history
 */
export const useSearchHistory = () => {
  const [localHistory, setLocalHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage in sync whenever the in-memory list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localHistory));
    } catch {
      // Quota exceeded or private mode — fail silently
    }
  }, [localHistory]);

  /**
   * Add a new search to the front of the history list.
   * Duplicate entries (same label + same CGPA) are de-duped and refreshed.
   */
  const saveToHistory = useCallback((formData) => {
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: buildLabel(formData),
      timestamp: new Date().toISOString(),
      data: formData,
    };

    setLocalHistory((prev) => {
      // Remove any previous entry with the same major + degree to avoid clutter
      const filtered = prev.filter(
        (e) =>
          !(
            e.data?.intended_major === formData.intended_major &&
            e.data?.degree_applying_for === formData.degree_applying_for &&
            e.data?.cgpa === formData.cgpa
          )
      );
      return [newEntry, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const removeFromHistory = useCallback((id) => {
    setLocalHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setLocalHistory([]);
  }, []);

  return { localHistory, saveToHistory, removeFromHistory, clearHistory };
};
