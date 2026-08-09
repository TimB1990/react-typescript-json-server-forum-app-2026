// rankHelper.ts
import type { UserRank } from '../types/users';

export const getUserRank = (messageCount: number, ranks: UserRank[]): UserRank | null => {
  if (!ranks || ranks.length === 0) return null;

  // Sort descending by messageThreshold
  const sortedRanks = [...ranks].sort((a, b) => b.messageThreshold - a.messageThreshold);

  return sortedRanks.find((rank) => messageCount >= rank.messageThreshold) || null;
};