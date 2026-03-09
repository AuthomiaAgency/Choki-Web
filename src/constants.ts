const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
export const RANKING_START_DATE = yesterday.toISOString();
export const SEASON_DURATION_DAYS = 30;
