import { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  points: number;
  image: string;
  ingredients?: string[];
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'prepared' | 'completed' | 'cancelled';
  date: string;
  hasPromo?: boolean;
  pointsEarned: number;
  isRedemption?: boolean;
  pointsCost?: number;
}

export interface ChokiPointTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent' | 'penalty';
  description: string;
  date: string;
}

export interface PromoCondition {
  type: 'product_id' | 'min_total' | 'min_quantity';
  target?: string; // Product ID if type is product_id
  threshold: number; // Quantity or Amount
}

export interface PromoReward {
  type: 'discount_percentage' | 'discount_fixed' | 'bonus_points';
  value: number;
}

export interface Promo {
  id: string;
  name: string;
  description: string;
  active: boolean;
  isFeatured: boolean;
  condition: PromoCondition;
  reward: PromoReward;
  productIds?: string[]; // Legacy support or for specific product targeting in reward
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  points: number;
  avatar: string;
  history: Order[];
  pointHistory: ChokiPointTransaction[];
  notifications: { id: string; message: string; date: string; expiresAt: string }[];
  lastNameChange?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Chocoteja de Pecana',
    description: 'La clásica y favorita. Relleno suave de manjar blanco artesanal con una pecana entera tostada, cubierta de chocolate bitter 60%.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate Bitter 60%', 'Manjar Blanco', 'Pecana Tostada'],
    stock: 50
  },
  {
    id: '2',
    name: 'Nutella Supreme',
    description: 'Una explosión de avellanas. Centro cremoso de Nutella pura con trozos de avellana, envuelto en chocolate de leche.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate de Leche', 'Nutella', 'Avellanas Tostadas'],
    stock: 35
  },
  {
    id: '3',
    name: 'Oreo Noir',
    description: 'Crujiente y cremosa. Relleno de crema de Oreo con trozos de galleta, cubierta de chocolate blanco marmoleado.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate Blanco', 'Crema de Oreo', 'Galleta Oreo'],
    stock: 40
  },
  {
    id: '4',
    name: 'Coco Tropical',
    description: 'Un viaje al caribe. Relleno de cocada artesanal húmeda, bañada en chocolate bitter para un contraste perfecto.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1616486029423-aaa478965c96?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate Bitter', 'Coco Rallado', 'Leche Condensada'],
    stock: 25
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alexander Pierce',
  email: 'alex@example.com',
  role: 'client', 
  points: 120,
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
  history: [],
  pointHistory: [],
  notifications: []
};
