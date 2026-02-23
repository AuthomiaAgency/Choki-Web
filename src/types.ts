import { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  price: number;
  points: number;
  image: string;
  ingredients?: string[];
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
  cancelledBy?: 'client' | 'admin';
  date: string;
  hasPromo?: boolean;
  appliedPromoName?: string;
  promoMultiplier?: number;
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
  type: 'product_id' | 'min_total' | 'min_quantity' | 'product_list';
  target?: string; // Product ID if type is product_id
  targets?: string[]; // Product IDs if type is product_list
  threshold: number; // Quantity or Amount
}

export interface PromoReward {
  type: 'discount_percentage' | 'discount_fixed' | 'bonus_points' | 'promo_price' | 'multi_reward';
  value: number; // Primary value
  promoPrice?: number; // Final price
  discountAmount?: number; // Discount amount
  extraPoints?: number; // Extra points
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

export interface CustomLanding {
  id: string;
  name: string;
  welcomeMessage: string;
  buttonText: string;
  slug: string; // For the URL
}

export interface AdvancedConfig {
  landings: CustomLanding[];
}

export const DEFAULT_CONFIG: AdvancedConfig = {
  landings: []
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Chocoteja de Pecana',
    description: 'La clásica y favorita. Relleno suave de manjar blanco artesanal con una pecana entera tostada, cubierta de chocolate bitter 60%.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate Bitter 60%', 'Manjar Blanco', 'Pecana Tostada']
  },
  {
    id: '2',
    name: 'Nutella Supreme',
    description: 'Una explosión de avellanas. Centro cremoso de Nutella pura con trozos de avellana, envuelto en chocolate de leche.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate de Leche', 'Nutella', 'Avellanas Tostadas']
  },
  {
    id: '3',
    name: 'Oreo Noir',
    description: 'Crujiente y cremosa. Relleno de crema de Oreo con trozos de galleta, cubierta de chocolate blanco marmoleado.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate Blanco', 'Crema de Oreo', 'Galleta Oreo']
  },
  {
    id: '4',
    name: 'Coco Tropical',
    description: 'Un viaje al caribe. Relleno de cocada artesanal húmeda, bañada en chocolate bitter para un contraste perfecto.',
    price: 1.50,
    points: 15,
    image: 'https://images.unsplash.com/photo-1616486029423-aaa478965c96?q=80&w=1000&auto=format&fit=crop',
    ingredients: ['Chocolate Bitter', 'Coco Rallado', 'Leche Condensada']
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
