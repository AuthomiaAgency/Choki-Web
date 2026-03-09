import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
}

export function calculateSeasonWinner(users: User[], seasonStartDate: string) {
  const activeUsers = users.filter(u => u.email && u.email.trim() !== '' && !u.name.toLowerCase().includes('eliminad'));
  
  const pointsRanking = activeUsers.map(u => {
    const pointsEarned = (u.pointHistory || [])
      .filter(tx => new Date(tx.date) >= new Date(seasonStartDate) && tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    return {
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      value: pointsEarned,
      seasonId: seasonStartDate
    };
  }).filter(u => u.value > 0).sort((a, b) => b.value - a.value);

  return pointsRanking.length > 0 ? pointsRanking[0] : null;
}

export function getNextMonthFirstDay() {
  const now = new Date();
  
  // Get current time in UTC
  const utcTime = now.getTime();
  
  // Shift to Peru Time (UTC-5)
  const peruTime = new Date(utcTime - (5 * 60 * 60 * 1000));
  
  // Calculate the next month in Peru Time
  const nextYear = peruTime.getUTCMonth() === 11 ? peruTime.getUTCFullYear() + 1 : peruTime.getUTCFullYear();
  const nextMonth = (peruTime.getUTCMonth() + 1) % 12;
  
  // Create the date for the 1st of the next month at 00:00:00 Peru Time
  // Which is 05:00:00 UTC
  const nextMonthDate = new Date(Date.UTC(nextYear, nextMonth, 1, 5, 0, 0));
  
  return nextMonthDate.toISOString();
}

export function getChocolateAvatar(id: number) {
  // Friendly, well-made people avatars with light colors
  // Using specific "happy/hungry" parameters for avataaars
  const backgrounds = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];
  const bg = backgrounds[id % backgrounds.length];
  
  // Mouths: smile, tongue, twinkle
  const mouths = ['smile', 'tongue', 'twinkle'];
  const mouth = mouths[id % mouths.length];
  
  // Eyes: happy, wink, winkWacky, default
  const eyesList = ['happy', 'wink', 'winkWacky', 'default'];
  const eyes = eyesList[id % eyesList.length];

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=choki-${id}&backgroundColor=${bg}&mouth=${mouth}&eyes=${eyes}`;
}

export const CHOCOLATE_AVATARS = Array.from({ length: 10 }).map((_, i) => getChocolateAvatar(i));
