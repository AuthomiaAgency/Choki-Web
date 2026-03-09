import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
}

export function getChocolateAvatar(id: number) {
  // Face-only, centered, cute, friendly expressions
  let eyes = `<circle cx="35" cy="45" r="6" fill="#3E2723" /><circle cx="33" cy="43" r="2" fill="#FFFFFF" />
              <circle cx="65" cy="45" r="6" fill="#3E2723" /><circle cx="63" cy="43" r="2" fill="#FFFFFF" />`;
  let mouth = `<path d="M 40 65 Q 50 75 60 65" fill="none" stroke="#3E2723" stroke-width="4" stroke-linecap="round" />`;

  switch (id) {
    case 1: // Happy
      mouth = `<path d="M 35 60 Q 50 80 65 60" fill="none" stroke="#3E2723" stroke-width="5" stroke-linecap="round" />`;
      break;
    case 2: // Surprised
      mouth = `<circle cx="50" cy="70" r="6" fill="#3E2723" />`;
      break;
    case 3: // Winking
      eyes = `<circle cx="35" cy="45" r="6" fill="#3E2723" /><circle cx="33" cy="43" r="2" fill="#FFFFFF" />
              <path d="M 60 45 Q 65 40 70 45" fill="none" stroke="#3E2723" stroke-width="4" stroke-linecap="round" />`;
      break;
    case 4: // Thinking
      eyes = `<circle cx="35" cy="45" r="6" fill="#3E2723" /><circle cx="33" cy="43" r="2" fill="#FFFFFF" />
              <circle cx="65" cy="45" r="6" fill="#3E2723" /><circle cx="63" cy="43" r="2" fill="#FFFFFF" />`;
      mouth = `<path d="M 40 65 Q 50 60 60 65" fill="none" stroke="#3E2723" stroke-width="4" stroke-linecap="round" />`;
      break;
    case 5: // Love
      eyes = `<path d="M 35 50 A 4 4 0 0 1 29 50 A 4 4 0 0 1 35 44 A 4 4 0 0 1 41 50 A 4 4 0 0 1 35 50 Z" fill="#E53935" />
              <path d="M 65 50 A 4 4 0 0 1 59 50 A 4 4 0 0 1 65 44 A 4 4 0 0 1 71 50 A 4 4 0 0 1 65 50 Z" fill="#E53935" />`;
      break;
    case 6: // Cool
      eyes = `<rect x="25" y="42" width="20" height="8" rx="2" fill="#212121" />
              <rect x="55" y="42" width="20" height="8" rx="2" fill="#212121" />`;
      break;
    case 7: // Shy
      mouth = `<path d="M 40 65 Q 50 75 60 65" fill="none" stroke="#3E2723" stroke-width="4" stroke-linecap="round" />`;
      break;
    case 8: // Excited
      mouth = `<path d="M 35 60 Q 50 85 65 60" fill="none" stroke="#3E2723" stroke-width="5" stroke-linecap="round" />`;
      break;
    case 9: // Neutral
    default:
      break;
  }

  const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Face shape -->
    <circle cx="50" cy="50" r="45" fill="#8B4513" />
    <circle cx="50" cy="50" r="40" fill="#A0522D" />
    
    ${eyes}
    ${mouth}
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const CHOCOLATE_AVATARS = Array.from({ length: 10 }).map((_, i) => getChocolateAvatar(i));
