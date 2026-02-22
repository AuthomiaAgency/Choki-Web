import { useApp, AppProvider } from './context';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Navbar } from './components/Navbar';
import { AdminPanel } from './components/AdminPanel';
import { LandingPage } from './components/LandingPage';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { FloatingCartBar } from './components/FloatingCartBar';
import { CheckoutPage } from './components/CheckoutPage';
import { OrdersPage } from './components/OrdersPage';
import { PromosPage } from './components/PromosPage';
import { SettingsPage } from './components/SettingsPage';
import { ChokistorialPage } from './components/ChokistorialPage';
import { RewardsPage } from './components/RewardsPage';
import { useState } from 'react';
import { Product } from './types';
import { ShoppingBag, Search, Package, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, products, activeTab, toggleCart, cart, setActiveTab, justAdded, advancedConfig } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [landingConfig, setLandingConfig] = useState<any>(null);

  // Redirect admin to orders if on home
  useState(() => {
    if (user?.role === 'admin' && activeTab === 'home') {
      setActiveTab('admin-orders');
    }
  });

  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const landingSlug = params.get('landing');
    const isInstall = params.get('install');

    if (isInstall) {
      setLandingConfig({
        name: 'Choki App',
        welcomeMessage: 'Instala nuestra App oficial para la mejor experiencia',
        buttonText: 'Instalar Ahora'
      });
      setShowLanding(true);
      // We can't auto-trigger install due to browser security, but the LandingPage 
      // will be shown with the "Install Now" button prominent.
      return;
    }

    if (landingSlug && advancedConfig?.landings) {
      const config = advancedConfig.landings.find(l => l.slug === landingSlug);
      if (config) {
        setLandingConfig(config);
        setShowLanding(true);
      }
    } else if (advancedConfig?.showLanding) {
      const hasSeenLanding = sessionStorage.getItem('hasSeenLanding');
      if (!hasSeenLanding) {
        // Use first custom landing or default if none
        if (advancedConfig.landings && advancedConfig.landings.length > 0) {
          setLandingConfig(advancedConfig.landings[0]);
        } else {
           setLandingConfig({
             name: 'Choki Lover',
             welcomeMessage: 'Bienvenido a la experiencia Choki',
             buttonText: 'Instalar Aquí'
           });
        }
        setShowLanding(true);
        sessionStorage.setItem('hasSeenLanding', 'true');
      }
    }
  });

  const handleLandingComplete = () => {
    setShowLanding(false);
    // Clear query params without refresh
    window.history.replaceState({}, '', window.location.pathname);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <>
        <Auth />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const isAdmin = user.role === 'admin';

  // Admin View Logic
  if (isAdmin && (activeTab.startsWith('admin-') || activeTab === 'home')) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-safe">
        <AdminPanel />
        <Navbar />
        <Toaster position="top-center" theme="dark" />
      </div>
    );
  }

  if (activeTab === 'checkout') {
    return (
      <>
        <CheckoutPage />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (activeTab === 'orders') {
    return (
      <>
        <OrdersPage />
        <Navbar />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans pb-32 transition-colors duration-300">
      <AnimatePresence>
        {showLanding && landingConfig && (
          <LandingPage 
            config={landingConfig} 
            onComplete={handleLandingComplete} 
          />
        )}
      </AnimatePresence>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between border-b border-neutral-200 dark:border-white/5 transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden border border-orange-500/10">
            <img 
              src="https://copilot.microsoft.com/th/id/BCO.0422c8a8-09b8-4328-bec7-f147697257f1.png" 
              alt="Choki Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white leading-none">Choki</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/50 w-32 sm:w-48"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 transition-colors ${isSearchOpen ? 'text-primary' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            <Search size={20} />
          </button>
          {isAdmin ? (
            <button 
              onClick={() => setActiveTab('admin-shop')}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-xl font-display font-bold text-xs hover:bg-primary/20 transition-all"
            >
              <Settings size={16} />
              Editar
            </button>
          ) : (
            <motion.button 
              animate={justAdded ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
              onClick={() => setActiveTab('orders')} 
              className="relative p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <Package size={22} />
              {user.history.some(o => o.status === 'pending' || o.status === 'prepared') && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-neutral-50 dark:border-neutral-950" />
              )}
            </motion.button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <>
            {/* Hero / Welcome */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-0.5 tracking-tight">
                Hola, {user.name.split(' ')[0]} 👋
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm sm:text-lg">
                ¿Qué dulce momento buscas hoy?
              </p>
            </div>

            {/* Grid */}
            <div className="px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pb-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => setSelectedProduct(product)} 
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'promos' && <PromosPage />}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'chokistorial' && <ChokistorialPage />}
        {activeTab === 'rewards' && <RewardsPage />}
      </main>

      <Navbar />
      {!isAdmin && <FloatingCartBar />}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      {!isAdmin && <CartDrawer />}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
