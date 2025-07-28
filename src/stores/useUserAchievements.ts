import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Milestone {
  score: number;
  achieved: boolean;
  achievedAt?: Date;
}

interface UserAchievementsStore {
  milestones: Record<string, Milestone>;
  showCelebration: boolean;
  currentCelebration: {
    score: number;
    message: string;
  } | null;
  
  checkMilestones: (currentScore: number) => void;
  dismissCelebration: () => void;
}

const MILESTONE_LEVELS = [100, 500, 1000, 2500, 5000];

export const useUserAchievements = create<UserAchievementsStore>()(
  persist(
    (set, get) => ({
      milestones: MILESTONE_LEVELS.reduce((acc, level) => ({
        ...acc,
        [level]: { score: level, achieved: false }
      }), {}),
      showCelebration: false,
      currentCelebration: null,

      checkMilestones: (currentScore: number) => {
        const { milestones } = get();
        let newMilestone: Milestone | null = null;

        // Check for newly achieved milestones
        for (const level of MILESTONE_LEVELS) {
          const milestone = milestones[level];
          if (currentScore >= level && !milestone.achieved) {
            newMilestone = {
              score: level,
              achieved: true,
              achievedAt: new Date()
            };
            break; // Only celebrate one milestone at a time
          }
        }

        if (newMilestone) {
          set({
            milestones: {
              ...milestones,
              [newMilestone.score]: newMilestone
            },
            showCelebration: true,
            currentCelebration: {
              score: newMilestone.score,
              message: `Congrats! You've reached ${newMilestone.score} impact points! 🎉`
            }
          });
        }
      },

      dismissCelebration: () => {
        set({
          showCelebration: false,
          currentCelebration: null
        });
      }
    }),
    {
      name: 'user-achievements-store'
    }
  )
);