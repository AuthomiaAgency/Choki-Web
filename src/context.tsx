import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Order, Product, User, PRODUCTS, Promo, ChokiPointTransaction } from './types';
import { toast } from 'sonner';
import { auth, db } from './firebase';
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
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newOrder = change.doc.data() as Order;
              // Check if order is recent (created in last 10 seconds) to avoid initial load notifications
              const orderTime = new Date(newOrder.date).getTime();
              const now = Date.now();
              if (newOrder.status === 'pending' && (now - orderTime < 10000)) {
                toast.success(`¡Nuevo pedido de ${newOrder.userName}!`, {
                  description: `Total: ${formatCurrency(newOrder.total)}`,
                  duration: 5000,
                  // icon: <ShoppingBag /> // Icon not imported here, using default or emoji
                });
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
      unsubOrders();
      unsubUser();
    };
  }, [user?.id, user?.role]);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast.success('¡Bienvenido!');
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
      toast.success('¡Bienvenido con Google!');
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
      toast.success('¡Registro exitoso!');
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
    toast.success('Nombre actualizado');
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
    
    toast.success('¡Añadido!', {
      description: `${quantity}x ${product.name}`,
    });
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

  const placeOrder = async (hasPromo = false) => {
    if (cart.length === 0 || !user || !db) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let pointsEarned = Math.floor(total * 10);

    // Check for bonus points promo
    const activePromos = promos.filter(p => p.active);
    for (const promo of activePromos) {
      const { condition, reward } = promo;
      if (!condition || !reward) continue;
      
      let conditionMet = false;

      if (condition.type === 'product_id') {
        const targetItem = cart.find(item => item.id === condition.target);
        if (targetItem && targetItem.quantity >= condition.threshold) {
          conditionMet = true;
        }
      } else if (condition.type === 'min_total') {
        if (total >= condition.threshold) {
          conditionMet = true;
        }
      } else if (condition.type === 'min_quantity') {
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQty >= condition.threshold) {
          conditionMet = true;
        }
      }

      if (conditionMet && reward.type === 'bonus_points') {
        pointsEarned += reward.value;
      }
    }
    
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      items: [...cart],
      total,
      status: 'pending',
      date: new Date().toISOString(),
      hasPromo,
      pointsEarned
    };

    try {
      // Add to orders collection
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
      
      const updatedHistory = [newOrder, ...user.history].slice(0, 50);
      
      await updateDoc(doc(db, 'users', user.id), {
        history: updatedHistory,
      });

      clearCart();
      setIsCartOpen(false);
      setActiveTab('orders'); 
      toast.success('¡Pedido confirmado!', {
        description: 'Redirigiendo a tus pedidos...',
        duration: 3000,
      });
    } catch (e: any) {
      toast.error('Error al realizar pedido: ' + e.message);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!user || !db) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled' });
      
      // Check for penalty
      const orderDate = new Date(order.date);
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

      toast.success('Has cancelado el pedido');
    } catch (e: any) {
      toast.error('Error al cancelar: ' + e.message);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      
      // If completed, give points to user
      const order = orders.find(o => o.id === orderId);
      if (order && (status === 'completed') && order.status !== 'completed') {
        const userRef = doc(db, 'users', order.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data() as User;
          const newPoints = uData.points + order.pointsEarned;
          const newTx: ChokiPointTransaction = {
            id: `tx-${Date.now()}`,
            amount: order.pointsEarned,
            type: 'earned',
            description: `Puntos por pedido #${orderId.slice(-6)}`,
            date: new Date().toISOString()
          };
          
          const notification = {
             id: `n-${Date.now()}`,
             message: `¡LISTO, YA TIENES ${order.pointsEarned} CHOKIPOINTS!! ✨`,
             date: new Date().toISOString(),
             expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          };

          await updateDoc(userRef, {
            points: newPoints,
            pointHistory: [newTx, ...uData.pointHistory],
            notifications: [notification, ...uData.notifications]
          });
        }
      }
      
      if (order && status === 'prepared') {
         // Notify user
         const userRef = doc(db, 'users', order.userId);
         const userSnap = await getDoc(userRef);
         if (userSnap.exists()) {
            const uData = userSnap.data() as User;
            const notification = {
               id: `n-${Date.now()}`,
               message: '¡Tu pedido está PREPARADO! 📦',
               date: new Date().toISOString(),
               expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
            };
            await updateDoc(userRef, {
               notifications: [notification, ...uData.notifications]
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

    try {
      await updateDoc(doc(db, 'users', user.id), {
        points: user.points - cost,
        pointHistory: [tx, ...user.pointHistory]
      });
      toast.success(`¡Premio canjeado!`, {
        description: `Disfruta tu ${product.name}`,
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
      toast.success('Producto añadido');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'products', id), p);
      toast.success('Producto actualizado');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.error('Producto eliminado');
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
      toast.success('Promoción añadida');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const updatePromo = async (id: string, p: Partial<Promo>) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'promos', id), p);
      toast.success('Promoción actualizada');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const deletePromo = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'promos', id));
      toast.error('Promoción eliminada');
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
    orders
      .filter(o => o.status === 'completed')
      .forEach(o => {
        o.items.forEach(item => {
          // Use product name as category since category is removed
          sales[item.name] = (sales[item.name] || 0) + item.quantity;
        });
      });
    return sales;
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
      setIsAuthMode
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
