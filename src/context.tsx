import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Order, Product, User, PRODUCTS, Promo, ChokiPointTransaction, AdvancedConfig, DEFAULT_CONFIG, CustomLanding } from './types';
import { toast } from 'sonner';
import { auth, db } from './firebase';
import { formatCurrency } from './utils';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  promos: Promo[];
  activeTab: string;
  isCartOpen: boolean;
  theme: 'dark' | 'light';
  justAdded: boolean;
  loading: boolean;
  
  // Actions
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  updateUserName: (name: string) => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  placeOrder: (hasPromo?: boolean) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  hideOrder: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  requestNotificationPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  toggleTheme: () => void;
  redeemPoints: (product: Product) => void;
  getTotalRevenue: () => number;
  getSectorizedSales: () => Record<string, number>;
  
  // Admin Actions
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addPromo: (promo: Omit<Promo, 'id'>) => void;
  updatePromo: (id: string, promo: Partial<Promo>) => void;
  deletePromo: (id: string) => void;
  
  // Navigation
  setActiveTab: (tab: string) => void;
  // User
  toggleRole: () => void;
  isAuthMode: 'login' | 'register';
  setIsAuthMode: (mode: 'login' | 'register') => void;
  highlightedProductIds: string[];
  setHighlightedProductIds: (ids: string[]) => void;
  advancedConfig: AdvancedConfig;
  updateAdvancedConfig: (config: Partial<AdvancedConfig>) => Promise<void>;
  addCustomLanding: (landing: Omit<CustomLanding, 'id'>) => Promise<CustomLanding>;
  deleteCustomLanding: (id: string) => Promise<void>;
  getAppliedPromo: () => Promo | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'register'>('login');
  const [justAdded, setJustAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [highlightedProductIds, setHighlightedProductIds] = useState<string[]>([]);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>(DEFAULT_CONFIG);

  const addCustomLanding = async (landing: Omit<CustomLanding, 'id'>) => {
    if (!db) throw new Error('DB not initialized');
    const id = Math.random().toString(36).substr(2, 9);
    const newLanding = { ...landing, id };
    const nextLandings = [...(advancedConfig.landings || []), newLanding];
    await updateAdvancedConfig({ landings: nextLandings });
    return newLanding;
  };

  const deleteCustomLanding = async (id: string) => {
    if (!db) return;
    const nextLandings = advancedConfig.landings.filter(l => l.id !== id);
    await updateAdvancedConfig({ landings: nextLandings });
  };

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Create user doc if it doesn't exist (e.g. Google Sign In first time)
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuario',
            email: firebaseUser.email || '',
            role: 'client',
            points: 0,
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            history: [],
            pointHistory: [],
            notifications: []
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
        setCart([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Listeners
  useEffect(() => {
    // Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(prods);
    });

    // Promos
    const unsubPromos = onSnapshot(collection(db, 'promos'), (snapshot) => {
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Promo));
      setPromos(p);
    });

    // Advanced Config
    const unsubConfig = onSnapshot(doc(db, 'settings', 'advanced'), (doc) => {
      if (doc.exists()) {
        setAdvancedConfig(doc.data() as AdvancedConfig);
      }
    });

    // Orders
    let unsubOrders = () => {};
    
    if (user) {
      const ordersQuery = user.role === 'admin' 
        ? query(collection(db, 'orders'), orderBy('date', 'desc'))
        : query(collection(db, 'orders'), where('userId', '==', user.id));
        
      unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
        const ords = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        
        // Notify Admin of new orders
        if (user.role === 'admin') {
          const now = Date.now();
          const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
          
          // Auto-delete old cancelled orders
          ords.forEach(o => {
            if (o.status === 'cancelled') {
              const orderTime = new Date(o.date).getTime();
              if (orderTime < thirtyDaysAgo) {
                deleteOrder(o.id).catch(console.error);
              }
            }
          });

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newOrder = change.doc.data() as Order;
              // Check if order is recent (created in last 10 seconds) to avoid initial load notifications
              const orderTime = new Date(newOrder.date).getTime();
              if (newOrder.status === 'pending' && (now - orderTime < 10000)) {
                  // Removed toast for new order as requested
                }
              }
            });
        }

        // Client-side sort for user orders to avoid composite index requirement
        if (user.role !== 'admin') {
          ords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        setOrders(ords);
      });
    }

    // User Data Realtime Update
    let unsubUser = () => {};
    if (user?.id) {
       unsubUser = onSnapshot(doc(db, 'users', user.id), (doc) => {
         if (doc.exists()) {
           setUser(doc.data() as User);
         }
       });
    }

    return () => {
      unsubProducts();
      unsubPromos();
      unsubConfig();
      unsubOrders();
      unsubUser();
    };
  }, [user?.id, user?.role]);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error: any) {
      toast.error('Error al iniciar sesión: ' + error.message);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return false;
      }
      if (error.code === 'auth/unauthorized-domain') {
        toast.error(`Dominio no autorizado: ${window.location.hostname}`);
        console.error(`Agrega "${window.location.hostname}" a Authorized Domains en Firebase Console -> Auth -> Settings`);
        return false;
      }
      toast.error('Error con Google: ' + error.message);
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      
      const newUser: User = {
        id: cred.user.uid,
        name,
        email,
        role: 'client',
        points: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        history: [],
        pointHistory: [],
        notifications: []
      };
      
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      return true;
    } catch (error: any) {
      toast.error('Error al registrarse: ' + error.message);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Correo de recuperación enviado');
      return true;
    } catch (error: any) {
      toast.error('Error al enviar correo: ' + error.message);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setCart([]);
    setActiveTab('home');
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.id), data);
  };

  const updateUserName = async (newName: string) => {
    if (!user) return;
    const now = new Date();
    if (user.lastNameChange) {
      const lastChange = new Date(user.lastNameChange);
      const diff = now.getTime() - lastChange.getTime();
      const hours = diff / (1000 * 60 * 60);
      if (hours < 24) {
        toast.error(`Solo puedes cambiar tu nombre cada 24 horas. Faltan ${Math.ceil(24 - hours)} horas.`);
        return;
      }
    }
    await updateDoc(doc(db, 'users', user.id), {
      name: newName,
      lastNameChange: now.toISOString()
    });
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const toggleCart = () => setIsCartOpen(prev => !prev);

  const getAppliedPromo = () => {
    const activePromos = promos.filter(p => p.active);
    let bestPromo = null;
    let maxSavings = -1; 

    for (const promo of activePromos) {
      const { condition, reward } = promo;
      let savings = 0;
      let points = 0;
      let multiplier = 0;

      // 1. Calculate Multiplier
      if (condition.type === 'product_id') {
        const targetItem = cart.find(item => item.id === condition.target);
        if (targetItem && targetItem.quantity >= condition.threshold) {
          multiplier = Math.floor(targetItem.quantity / condition.threshold);
        }
      } else if (condition.type === 'product_list') {
        const matchingItems = cart.filter(item => condition.targets?.includes(item.id));
        const totalQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQty >= condition.threshold) {
          multiplier = Math.floor(totalQty / condition.threshold);
        }
      } else if (condition.type === 'min_total') {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (total >= condition.threshold) {
           multiplier = Math.floor(total / condition.threshold);
        }
      } else if (condition.type === 'min_quantity') {
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQty >= condition.threshold) {
          multiplier = Math.floor(totalQty / condition.threshold);
        }
      }

      if (multiplier > 0) {
        // 2. Calculate Benefits
        
        // Helper to get eligible items value for percentage/fixed calculation
        const getEligibleValue = () => {
           if (condition.type === 'product_id') {
              const item = cart.find(i => i.id === condition.target);
              return item ? item.price * (condition.threshold * multiplier) : 0;
           } else if (condition.type === 'product_list') {
              // For product list, we take the items that contribute to the sets
              // We'll approximate by taking the average price of matching items * total count needed
              // Or better: Sort items by price (descending) and take the top N items?
              // Usually promos apply to the *cheapest* or *specific* items.
              // Let's apply to the total value of matching items for simplicity and user benefit.
              const matchingItems = cart.filter(item => condition.targets?.includes(item.id));
              return matchingItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
           } else {
              return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
           }
        };

        if (reward.type === 'discount_percentage') {
           const eligibleValue = getEligibleValue();
           savings = eligibleValue * ((reward.value || 0) / 100);
        } else if (reward.type === 'discount_fixed') {
           savings = (reward.value || 0) * multiplier;
        } else if (reward.type === 'promo_price') {
           // Fixed price for the set
           if (condition.type === 'product_id') {
              const item = cart.find(i => i.id === condition.target);
              if (item) {
                const originalSetPrice = item.price * condition.threshold;
                // Fallback to reward.value if promoPrice is missing (legacy/UI compat)
                const promoSetPrice = (reward.promoPrice !== undefined && reward.promoPrice !== 0) ? reward.promoPrice : (reward.value || 0);
                
                // Only apply if it's actually a discount (promo price < original price)
                if (promoSetPrice < originalSetPrice && promoSetPrice > 0) {
                   savings = (originalSetPrice - promoSetPrice) * multiplier;
                }
              }
           } else if (condition.type === 'product_list') {
              // For product list, we need to find the items that make up the set.
              let countNeeded = condition.threshold * multiplier;
              let originalPriceTotal = 0;
              const matchingItems = cart.filter(item => condition.targets?.includes(item.id));
              
              // Sort by price descending to maximize savings? Or ascending?
              // Usually promos apply to specific items. Let's just take them in order.
              for (const item of matchingItems) {
                 const qtyToTake = Math.min(item.quantity, countNeeded);
                 originalPriceTotal += item.price * qtyToTake;
                 countNeeded -= qtyToTake;
                 if (countNeeded <= 0) break;
              }
              
              const promoSetPrice = (reward.promoPrice !== undefined && reward.promoPrice !== 0) ? reward.promoPrice : (reward.value || 0);
              const promoTotal = promoSetPrice * multiplier;
              
              if (promoTotal < originalPriceTotal && promoTotal > 0) {
                 savings = originalPriceTotal - promoTotal;
              }
           }
        } else if (reward.type === 'bonus_points') {
           points = (reward.value || 0) * multiplier;
        } else if (reward.type === 'multi_reward') {
           if (reward.discountAmount) savings += (reward.discountAmount * multiplier);
           if (reward.extraPoints) points += (reward.extraPoints * multiplier);
                      if (reward.promoPrice || reward.value) {
              // If promoPrice exists, it overrides discountAmount for the price part
              // We calculate savings from promoPrice and REPLACE discountAmount savings
              let priceSavings = 0;
              const promoSetPrice = (reward.promoPrice !== undefined && reward.promoPrice !== 0) ? reward.promoPrice : (reward.value || 0);
              
              if (condition.type === 'product_id') {
                 const item = cart.find(i => i.id === condition.target);
                 if (item) {
                   const originalSetPrice = item.price * condition.threshold;
                   priceSavings = (originalSetPrice - promoSetPrice) * multiplier;
                 }
              } else if (condition.type === 'product_list') {
                 let countNeeded = condition.threshold * multiplier;
                 let originalPriceTotal = 0;
                 const matchingItems = cart.filter(item => condition.targets?.includes(item.id));
                 for (const item of matchingItems) {
                    const qtyToTake = Math.min(item.quantity, countNeeded);
                    originalPriceTotal += item.price * qtyToTake;
                    countNeeded -= qtyToTake;
                    if (countNeeded <= 0) break;
                 }
                 priceSavings = originalPriceTotal - (promoSetPrice * multiplier);
              }
              
              if (priceSavings > 0) {
                 // If we calculated a valid promo price savings, use it.
                 // We add it to any EXISTING savings from other sources? 
                 // No, promoPrice usually implies "This is the price".
                 // So we should probably ignore discountAmount if promoPrice is set.
                 // But we already added discountAmount above. Let's subtract it and add priceSavings.
                 if (reward.discountAmount) savings -= (reward.discountAmount * multiplier);
                 savings += priceSavings;
              }
           }
        }

        if (savings > maxSavings || (savings === maxSavings && points > (bestPromo?.points || 0))) {
          maxSavings = savings;
          bestPromo = { promo, savings, points, multiplier };
        }
      }
    }
    
    return bestPromo;
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !user || !db) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const appliedPromoData = getAppliedPromo();
    
    let total = subtotal;
    let pointsEarned = 0;
    let appliedPromoName = '';

    if (appliedPromoData) {
      total = Math.max(0, subtotal - appliedPromoData.savings);
      pointsEarned = appliedPromoData.points;
      appliedPromoName = appliedPromoData.promo.name;
    }

    // Base points on final total (1 point per 10 currency units, for example, or 10 points per unit?)
    // User said "proportional to final price". 
    // Previous logic was `total * 10`. Let's keep that but use the discounted total.
    pointsEarned += Math.floor(total * 10);
    
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      items: [...cart],
      total,
      status: 'pending',
      date: new Date().toISOString(),
      hasPromo: !!appliedPromoData,
      appliedPromoName,
      promoMultiplier: appliedPromoData?.multiplier,
      pointsEarned
    };

    try {
      // Add to orders collection
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
      
      const updatedHistory = [newOrder, ...user.history].slice(0, 50);
      
      // Update user history
      // Note: We need to fetch the latest user data to ensure we don't overwrite points if they changed elsewhere,
      // but for this app context 'user' should be up to date via the listener.

      await updateDoc(doc(db, 'users', user.id), {
        history: updatedHistory
      });

      // Friendly Notification
      sendNotification('¡Pedido Recibido! 🍫', {
        body: `¡Hola ${user.name}! Hemos recibido tu pedido.`,
        icon: '/pwa-192x192.png'
      });

      setCart([]);
      setIsCartOpen(false);
      setActiveTab('orders');
      toast.success('¡Pedido realizado con éxito!');
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error('Error al realizar el pedido');
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!user || !db) return;
    
    // Check if order is prepared
    const order = orders.find(o => o.id === orderId);
    if (order?.status === 'prepared') {
      toast.error('No se puede cancelar un pedido que ya está preparado.');
      return;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: 'cancelled',
        cancelledBy: 'client'
      });
      
      // Check for penalty
      const orderDate = new Date(order?.date || Date.now());
      const now = new Date();
      const diffHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      
      if (diffHours > 1) {
        const penalty: ChokiPointTransaction = {
          id: `tx-${Date.now()}`,
          amount: -5,
          type: 'penalty',
          description: `Penalidad por cancelación tardía del pedido #${orderId.slice(-6)}`,
          date: now.toISOString()
        };
        
        const newPoints = Math.max(0, user.points - 5);
        const newHistory = [penalty, ...user.pointHistory].slice(0, 7);
        
        await updateDoc(doc(db, 'users', user.id), {
          points: newPoints,
          pointHistory: newHistory
        });
      }
      
      // Update local history in user doc
      const updatedHistory = user.history.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o);
      await updateDoc(doc(db, 'users', user.id), { history: updatedHistory });
    } catch (e: any) {
      toast.error('Error al cancelar: ' + e.message);
    }
  };

  const hideOrder = async (orderId: string) => {
    if (!user || !db) return;
    try {
      const newHistory = user.history.filter(o => o.id !== orderId);
      await updateDoc(doc(db, 'users', user.id), {
        history: newHistory
      });
    } catch (e: any) {
      toast.error('Error al eliminar: ' + e.message);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!db) return;
    try {
      // Get order to find user
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data() as Order;
        const userId = orderData.userId;
        
        // Remove from user history
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as User;
          const newHistory = userData.history.filter(o => o.id !== orderId);
          await updateDoc(userRef, { history: newHistory });
        }
      }

      await deleteDoc(orderRef);
    } catch (e: any) {
      toast.error('Error al eliminar: ' + e.message);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted' && localStorage.getItem('notificationsEnabled') !== 'false') {
      new Notification(title, options);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!db) return;
    try {
      const updateData: any = { status };
      if (status === 'cancelled') {
        updateData.cancelledBy = 'admin';
      }
      await updateDoc(doc(db, 'orders', orderId), updateData);
      
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const userRef = doc(db, 'users', order.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const uData = userSnap.data() as User;

      // Update local history in user doc
      const updatedHistory = uData.history.map(h => 
        h.id === orderId ? { ...h, status } : h
      );

      // Handle Completed (Pagado)
      if (status === 'completed' && order.status !== 'completed') {
        let newPoints = uData.points;
        let newPointHistory = uData.pointHistory;
        let pointsEarned = 0;

        if (!order.isRedemption) {
          pointsEarned = order.pointsEarned;
          newPoints += pointsEarned;
          const newTx: ChokiPointTransaction = {
            id: `tx-${Date.now()}`,
            amount: pointsEarned,
            type: 'earned',
            description: `Puntos por pedido #${orderId.slice(-6)}`,
            date: new Date().toISOString()
          };
          newPointHistory = [newTx, ...uData.pointHistory];
        }

        await updateDoc(userRef, {
          points: newPoints,
          pointHistory: newPointHistory,
          history: updatedHistory
        });
        
        sendNotification('¡Pedido Entregado! ✨', {
          body: `¡Gracias por tu compra, ${uData.name}! Has ganado ${pointsEarned} ChokiPoints. ¡Disfrútalos!`,
          icon: '/pwa-192x192.png'
        });
      } else if (order.status === 'completed' && status !== 'completed') {
        // If it was completed and now it's not (e.g., cancelled), deduct the points
        let newPoints = uData.points;
        let newPointHistory = uData.pointHistory;

        if (!order.isRedemption) {
          const pointsEarned = order.pointsEarned;
          newPoints = Math.max(0, newPoints - pointsEarned);
          const newTx: ChokiPointTransaction = {
            id: `tx-${Date.now()}`,
            amount: -pointsEarned,
            type: 'penalty',
            description: `Ajuste por cambio de estado del pedido #${orderId.slice(-6)}`,
            date: new Date().toISOString()
          };
          newPointHistory = [newTx, ...uData.pointHistory];
        }

        await updateDoc(userRef, {
          points: newPoints,
          pointHistory: newPointHistory,
          history: updatedHistory
        });
      } else {
        // Just update status for other states
        await updateDoc(userRef, { history: updatedHistory });
        
        if (status === 'prepared') {
          sendNotification('¡Tu pedido está listo! 🚀', {
            body: `¡Hola ${uData.name}! Tu pedido ya está preparado. ¡Está delicioso!`,
            icon: '/pwa-192x192.png'
          });
        }
      }
    } catch (e: any) {
      toast.error('Error al actualizar estado: ' + e.message);
    }
  };

  const redeemPoints = async (product: Product) => {
    if (!user || !db) return;
    const cost = product.price * 100;
    if (user.points < cost) {
      toast.error('No tienes suficientes ChokiPoints');
      return;
    }

    const tx: ChokiPointTransaction = {
      id: `tx-${Date.now()}`,
      amount: -cost,
      type: 'spent',
      description: `Canje de ${product.name}`,
      date: new Date().toISOString()
    };

    const redemptionOrder: Order = {
      id: `ord-red-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      items: [{ ...product, quantity: 1 }],
      total: 0,
      status: 'pending',
      date: new Date().toISOString(),
      hasPromo: false,
      pointsEarned: 0,
      isRedemption: true,
      pointsCost: cost
    };

    try {
      await updateDoc(doc(db, 'users', user.id), {
        points: user.points - cost,
        pointHistory: [tx, ...user.pointHistory],
        history: [redemptionOrder, ...user.history].slice(0, 50)
      });
      
      await setDoc(doc(db, 'orders', redemptionOrder.id), redemptionOrder);

      toast.success(`¡Premio canjeado!`, {
        description: `Disfruta tu ${product.name}. Revisa tus pedidos.`,
      });
    } catch (e: any) {
      toast.error('Error al canjear: ' + e.message);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleRole = async () => {
    if (!user || !db) return;
    const newRole = user.role === 'client' ? 'admin' : 'client';
    await updateDoc(doc(db, 'users', user.id), { role: newRole });
    toast.info(`Modo ${newRole === 'client' ? 'Cliente' : 'Admin'} activado`);
  };

  // Admin Product Actions
  const addProduct = async (p: Omit<Product, 'id'>) => {
    if (!db) return;
    try {
      const newP = { ...p };
      const docRef = await addDoc(collection(db, 'products'), newP);
      await updateDoc(docRef, { id: docRef.id });
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'products', id), p);
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  // Admin Promo Actions
  const addPromo = async (p: Omit<Promo, 'id'>) => {
    if (!db) return;
    try {
      const docRef = await addDoc(collection(db, 'promos'), p);
      await updateDoc(docRef, { id: docRef.id });
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const updatePromo = async (id: string, p: Partial<Promo>) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'promos', id), p);
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const deletePromo = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'promos', id));
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
  };

  const getSectorizedSales = () => {
    const sales: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    orders
      .filter(o => o.status === 'completed' && new Date(o.date) >= thirtyDaysAgo)
      .forEach(o => {
        o.items.forEach(item => {
          // Use product name as category since category is removed
          sales[item.name] = (sales[item.name] || 0) + item.quantity;
        });
      });
    return sales;
  };

  const updateAdvancedConfig = async (config: Partial<AdvancedConfig>) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'settings', 'advanced'), { ...advancedConfig, ...config }, { merge: true });
      toast.success('Configuración avanzada actualizada');
    } catch (e: any) {
      toast.error('Error al actualizar configuración: ' + e.message);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      products,
      cart,
      orders,
      promos,
      activeTab,
      isCartOpen,
      theme,
      justAdded,
      loading,
      login,
      loginWithGoogle,
      register,
      resetPassword,
      logout,
      updateUser,
      updateUserName,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleCart,
      placeOrder,
      cancelOrder,
      hideOrder,
      deleteOrder,
      requestNotificationPermission,
      sendNotification,
      updateOrderStatus,
      setActiveTab,
      toggleRole,
      toggleTheme,
      redeemPoints,
      addProduct,
      updateProduct,
      deleteProduct,
      addPromo,
      updatePromo,
      deletePromo,
      getTotalRevenue,
      getSectorizedSales,
      isAuthMode,
      setIsAuthMode,
      highlightedProductIds,
      setHighlightedProductIds,
      advancedConfig,
      updateAdvancedConfig,
      addCustomLanding,
      deleteCustomLanding,
      getAppliedPromo
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
