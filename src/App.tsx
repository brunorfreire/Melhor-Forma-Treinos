import React, { useState, useEffect } from 'react';
import { WorkoutPlan, ViewMode, Exercise } from './types';
import { SAMPLE_WORKOUT_PLAN } from './data/defaultPlans';
import { decodeWorkoutPlan } from './utils/codec';
import { StudentWorkoutView } from './components/StudentWorkoutView';
import { TrainerEditor } from './components/TrainerEditor';
import { ShareModal } from './components/ShareModal';
import { HostingerGuideModal } from './components/HostingerGuideModal';
import { MuscleWikiModal } from './components/MuscleWikiModal';
import { RestTimer } from './components/RestTimer';

const STORAGE_KEY = 'mf_treino_v1_lite_plan';

export default function App() {
  const [plan, setPlan] = useState<WorkoutPlan>(SAMPLE_WORKOUT_PLAN);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHostingerModalOpen, setIsHostingerModalOpen] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // Check URL on load for #plan=...
  useEffect(() => {
    const parseUrl = () => {
      const hash = window.location.hash;
      let encodedData = '';

      if (hash.includes('plan=')) {
        encodedData = hash.split('plan=')[1];
      } else if (window.location.search.includes('plan=')) {
        const params = new URLSearchParams(window.location.search);
        encodedData = params.get('plan') || '';
      }

      if (encodedData) {
        const decoded = decodeWorkoutPlan(encodedData);
        if (decoded) {
          setPlan(decoded);
          // If loaded from a shared URL link, start in Student Mode!
          setViewMode('student');
          return;
        }
      }

      // If no URL plan, load from local storage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.sessions)) {
            setPlan(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not load saved plan:', err);
      }
    };

    parseUrl();

    // Listen to hash changes (e.g. if link is clicked or pasted)
    window.addEventListener('hashchange', parseUrl);
    return () => window.removeEventListener('hashchange', parseUrl);
  }, []);

  // Save to localStorage when modified in editor
  const handleUpdatePlan = (updated: WorkoutPlan) => {
    setPlan(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start">
      {/* Active Main View */}
      {viewMode === 'student' ? (
        <>
          <StudentWorkoutView
            plan={plan}
            onEditPlan={() => setViewMode('editor')}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onPreviewExercise={(ex) => setPreviewExercise(ex)}
          />
          {/* Integrated Floating Rest Timer for Student */}
          <RestTimer />
        </>
      ) : (
        <TrainerEditor
          plan={plan}
          onChangePlan={handleUpdatePlan}
          onViewAsStudent={() => setViewMode('student')}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenHostingerGuide={() => setIsHostingerModalOpen(true)}
          onPreviewExercise={(ex) => setPreviewExercise(ex)}
        />
      )}

      {/* Modals */}
      {isShareModalOpen && (
        <ShareModal
          plan={plan}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {isHostingerModalOpen && (
        <HostingerGuideModal
          plan={plan}
          onClose={() => setIsHostingerModalOpen(false)}
        />
      )}

      {previewExercise && (
        <MuscleWikiModal
          exercise={previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}
    </main>
  );
}
