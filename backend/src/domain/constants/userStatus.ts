export const ALL_STATUSES = ['ACTIF', 'INACTIF', 'EN_ATTENTE'] as const;
export type UserStatus = typeof ALL_STATUSES[number];
