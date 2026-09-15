import React from 'react';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { Exercise } from '../types';

interface MuscleWikiModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

/**
 * Re-exporting ExerciseVideoModal for backward compatibility.
 * Opens YouTube video directly in-app without redirecting to external MuscleWiki tabs.
 */
export const MuscleWikiModal: React.FC<MuscleWikiModalProps> = ({ exercise, onClose }) => {
  return <ExerciseVideoModal exercise={exercise} onClose={onClose} />;
};

export { ExerciseVideoModal };
