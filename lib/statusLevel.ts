export type StatusTier = {
  level: number;
  title: string;
  description: string;
  color: string;
  threshold: number;
};

export const STATUS_TIERS: StatusTier[] = [
  {
    level: 0,
    title: 'متلصص',
    description: 'يراقب من الظلام.',
    color: '#6b7280',
    threshold: 0,
  },
  {
    level: 1,
    title: 'مبتدئ',
    description: 'يبدأ في ترك أثر.',
    color: '#78716c',
    threshold: 5,
  },
  {
    level: 2,
    title: 'عضو',
    description: 'وجه مألوف في القاعة.',
    color: '#8B0000',
    threshold: 15,
  },
  {
    level: 3,
    title: 'متمرس',
    description: 'صُلّب بالأرشيف.',
    color: '#c00000',
    threshold: 30,
  },
  {
    level: 4,
    title: 'كبير',
    description: 'حارس الميثاق.',
    color: '#e57368',
    threshold: 50,
  },
];

export function getStatusTier(statusLevel: number): StatusTier {
  // For admins (statusLevel 99), return a special Elder+ tier
  if (statusLevel >= 99) {
    return {
      level: 99,
      title: 'مدير',
      description: 'سلطة مطلقة.',
      color: '#8B0000',
      threshold: 99,
    };
  }

  // Find the highest tier the user qualifies for
  const tier = [...STATUS_TIERS]
    .reverse()
    .find((t) => statusLevel >= t.threshold);
  return tier ?? STATUS_TIERS[0];
}

/**
 * Returns the new statusLevel after incrementing by engagement.
 * Called whenever a user successfully posts a comment or reply.
 */
export function computeNewStatusLevel(currentLevel: number): number {
  if (currentLevel >= 50) return currentLevel; // Capped at Elder
  return currentLevel + 1;
}

/**
 * Checks if user should level up and returns the new tier if so.
 */
export function checkLevelUp(
  oldLevel: number,
  newLevel: number
): StatusTier | null {
  const oldTier = getStatusTier(oldLevel);
  const newTier = getStatusTier(newLevel);
  if (newTier.level > oldTier.level) return newTier;
  return null;
}
