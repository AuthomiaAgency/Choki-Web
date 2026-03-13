import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context';
import { Trophy, Star, Gift, Crown, ArrowRight, Medal } from 'lucide-react';
import { CHOCOLATE_AVATARS } from '../utils';
import { useRanking } from '../hooks/useRanking';

type RankingTab = 'buyers' | 'points' | 'redemptions';

export function RankingPage() {
  const { user, setActiveTab, startNewSeason, advancedConfig } = useApp();
  const [activeTab, setLocalTab] = useState<RankingTab>('buyers');
  const { loading, getRankingData, isSeasonOver, getRemainingTime, getHistoricalRecord } = useRanking();
  const seasonOver = isSeasonOver();
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());
  const historicalRecord = getHistoricalRecord(activeTab);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);

  useEffect(() => {
    if (seasonOver) return;
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [seasonOver]);

  const rankingData = getRankingData(activeTab, user?.id);
  const buyersRanking = getRankingData('buyers', user?.id);
  const pointsRanking = getRankingData('points', user?.id);
  const redemptionsRanking = getRankingData('redemptions', user?.id);

  const currentKing = rankingData.length > 0 ? rankingData[0] : null;
  const isCurrentUserWinner = currentKing?.id === user?.id;

  useEffect(() => {
    if (seasonOver && isCurrentUserWinner) {
      setShowWinnerAnimation(true);
    }
  }, [seasonOver, isCurrentUserWinner]);

  const handleCloseAnimation = () => {
    setShowWinnerAnimation(false);
  };

  const handleSendScreenshot = async () => {
    const whatsappNumber = "51999999999"; 
    const message = encodeURIComponent("¡Hola! Soy el rey de la temporada en ChocoApp y aquí está mi captura de pantalla para reclamar mi premio.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    
    if (currentKing) {
      await startNewSeason({
        id: currentKing.id,
        name: currentKing.name,
        avatar: currentKing.avatar,
        value: currentKing.value,
        seasonId: new Date().toISOString()
      });
    } else {
      await startNewSeason();
    }
    setShowWinnerAnimation(false);
  };

  const handleRenewRanking = async () => {
    if (currentKing) {
      await startNewSeason({
        id: currentKing.id,
        name: currentKing.name,
        avatar: currentKing.avatar,
        value: currentKing.value,
        seasonId: new Date().toISOString()
      });
    } else {
      await startNewSeason();
    }
    setShowWinnerAnimation(false);
  };

  const top3 = rankingData.slice(0, 3);
  const rest = rankingData.slice(3, 5); // Show up to top 5

  const isCurrentUserInRanking = rankingData.slice(0, 5).some(u => u.id === user?.id);

  const tabs = [
    { id: 'buyers', label: 'Compradores', icon: Star },
    { id: 'points', label: 'Chokipoints', icon: Trophy },
    { id: 'redemptions', label: 'Canjes', icon: Gift },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 relative">
      {/* Winner Animation Modal */}
      <AnimatePresence>
        {showWinnerAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-primary/20 text-center relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-primary/30"
                >
                  <Crown size={48} className="text-neutral-950" />
                </motion.div>
                
                <h2 className="font-display text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  ¡Felicidades, Rey!
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-8">
                  Has dominado la temporada. ¡Toma una captura de pantalla y envíala a nuestro WhatsApp para reclamar tu premio!
                </p>
                
                <button 
                  onClick={handleSendScreenshot}
                  className="w-full py-4 bg-primary text-neutral-950 font-bold font-display rounded-2xl hover:bg-primary/90 transition-colors relative z-10 shadow-lg shadow-primary/20 mb-3"
                >
                  Enviar Captura y Renovar
                </button>
                <button 
                  onClick={handleCloseAnimation}
                  className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold font-display rounded-2xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors relative z-10"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-6 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-3">
              <Trophy className="text-primary" size={32} />
              Salón de la Fama
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm sm:text-base">
              Los más dulces de nuestra comunidad
            </p>
          </div>
        </div>

        {/* Last Season Winner Banner */}
        {advancedConfig?.lastSeasonWinner && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/20 to-orange-500/20 border border-primary/30 rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-sm"
          >
            <div className="relative">
              <div className="absolute -top-2 -right-2 bg-primary text-neutral-950 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm">
                <Crown size={12} />
              </div>
              <img 
                src={advancedConfig.lastSeasonWinner.avatar} 
                alt={advancedConfig.lastSeasonWinner.name} 
                className="w-12 h-12 rounded-full border-2 border-primary object-cover"
              />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
                Rey de la Temporada Pasada
              </p>
              <p className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-1">
                {advancedConfig.lastSeasonWinner.name}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white block">
                {advancedConfig.lastSeasonWinner.value} pts
              </span>
            </div>
          </motion.div>
        )}

        {/* Corners Info */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-100 dark:border-white/5 mb-6">
          <div className="flex justify-between items-center mb-4">
            {/* Rey Actual */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -top-2 -left-2 bg-primary text-neutral-950 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Crown size={12} />
                </div>
                <img 
                  src={currentKing?.avatar || CHOCOLATE_AVATARS[0]} 
                  alt="Rey Actual" 
                  className="w-12 h-12 rounded-full border-2 border-primary object-cover bg-neutral-100 dark:bg-neutral-800"
                />
              </div>
              <div>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Rey Actual</p>
                <p className="font-display font-bold text-sm text-neutral-900 dark:text-white line-clamp-1 max-w-[100px]">
                  {currentKing?.name || 'Nadie aún'}
                </p>
              </div>
            </div>

            {/* Record Histórico */}
            <div className="text-right">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Récord Histórico</p>
              <p className="text-2xl font-display font-bold text-primary leading-none mt-1">
                {historicalRecord?.value || 0}
              </p>
            </div>
          </div>

          {/* Tiempo - Bottom Small */}
          <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                {seasonOver ? 'Temporada Finalizada' : 'Termina en:'}
              </p>
              <p className="text-xs font-display font-bold text-primary">
                {seasonOver ? '00:00:00' : `${timeLeft.days}d ${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`}
              </p>
            </div>
            <p className="text-[8px] text-neutral-400 font-medium italic">
              La temporada se reinicia automáticamente el 1 de cada mes.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 mb-4 -mt-4 relative z-20">
        <div className="flex bg-neutral-200/50 dark:bg-neutral-900/50 p-1 rounded-2xl items-stretch">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const isPointsTab = tab.id === 'points';
            return (
              <button
                key={tab.id}
                onClick={() => setLocalTab(tab.id)}
                className={`flex items-center justify-center gap-2 transition-all relative z-10 ${
                  isPointsTab ? 'flex-[1.2] py-3' : 'flex-1 py-2.5'
                } ${
                  isActive ? 'text-neutral-950' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="ranking-tab"
                    className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md shadow-primary/20"
                  />
                )}
                {isPointsTab && !isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-xl -z-10" />
                )}
                <tab.icon size={isPointsTab ? 18 : 16} className={isPointsTab && !isActive ? 'text-primary' : ''} />
                <span className={`font-display font-bold ${isPointsTab ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                  {tab.label}
                </span>
                {isPointsTab && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    PREMIO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {seasonOver ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 text-center border border-primary/20 shadow-xl shadow-primary/5 mt-8"
          >
            <Crown size={48} className="text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              ¡Temporada Finalizada!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              Los reyes de esta temporada han sido coronados.
            </p>
            
            <div className="space-y-4">
              {/* Show winners for all categories */}
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl flex items-center gap-4">
                <Star className="text-primary shrink-0" />
                <div className="text-left flex-grow">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Rey de Compras</p>
                  <p className="font-display font-bold text-neutral-900 dark:text-white line-clamp-1">
                    {buyersRanking[0]?.name || 'Nadie'}
                  </p>
                </div>
                <span className="font-bold text-primary text-sm">{buyersRanking[0]?.formattedValue || '0'}</span>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-2xl flex items-center gap-4 border border-primary/20">
                <Trophy className="text-primary shrink-0" />
                <div className="text-left flex-grow">
                  <p className="text-[10px] font-bold text-primary uppercase">Rey de Chokipoints</p>
                  <p className="font-display font-bold text-neutral-900 dark:text-white line-clamp-1">
                    {pointsRanking[0]?.name || 'Nadie'}
                  </p>
                </div>
                <span className="font-bold text-primary text-sm">{pointsRanking[0]?.formattedValue || '0'}</span>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl flex items-center gap-4">
                <Gift className="text-primary shrink-0" />
                <div className="text-left flex-grow">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Rey de Canjes</p>
                  <p className="font-display font-bold text-neutral-900 dark:text-white line-clamp-1">
                    {redemptionsRanking[0]?.name || 'Nadie'}
                  </p>
                </div>
                <span className="font-bold text-primary text-sm">{redemptionsRanking[0]?.formattedValue || '0'}</span>
              </div>
            </div>
            
            {isCurrentUserWinner ? (
              <button 
                onClick={handleSendScreenshot}
                className="w-full mt-8 py-4 bg-primary text-neutral-950 font-bold font-display rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Enviar Captura y Renovar
              </button>
            ) : (
              <button 
                onClick={handleRenewRanking}
                className="w-full mt-8 py-4 bg-primary text-neutral-950 font-bold font-display rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Renovar Ranking
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Top 3 Pyramid */}
            <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8 mt-12 h-48">
              {/* 2nd Place */}
              {top3[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center relative w-24 sm:w-28"
                >
                  <div className="absolute -top-6 bg-neutral-200 dark:bg-neutral-800 text-neutral-500 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white dark:border-neutral-950 z-10">
                    2
                  </div>
                  <img src={top3[1].avatar} alt={top3[1].name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-neutral-200 dark:border-neutral-800 object-cover bg-white dark:bg-neutral-900 z-0" />
                  <div className="bg-neutral-200 dark:bg-neutral-800 w-full h-24 sm:h-28 mt-[-10px] rounded-t-xl flex flex-col items-center justify-end pb-3 px-2 text-center">
                    <span className="font-display font-bold text-xs sm:text-sm text-neutral-900 dark:text-white line-clamp-1 w-full">{top3[1].name}</span>
                    <span className="text-[10px] sm:text-xs text-primary font-bold">{top3[1].formattedValue}</span>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center relative w-28 sm:w-32 z-10"
                >
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-8 text-primary z-20 drop-shadow-md"
                  >
                    <Crown size={32} className="fill-primary" />
                  </motion.div>
                  <div className="absolute -top-4 bg-primary text-neutral-950 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-neutral-950 z-10 shadow-lg shadow-primary/30">
                    1
                  </div>
                  <img src={top3[0].avatar} alt={top3[0].name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-primary object-cover bg-white dark:bg-neutral-900 z-0 shadow-xl shadow-primary/20" />
                  <div className="bg-gradient-to-t from-primary/20 to-primary/5 border border-primary/20 w-full h-32 sm:h-36 mt-[-10px] rounded-t-xl flex flex-col items-center justify-end pb-4 px-2 text-center">
                    <span className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-1 w-full">{top3[0].name}</span>
                    <span className="text-xs sm:text-sm text-primary font-bold">{top3[0].formattedValue}</span>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center relative w-24 sm:w-28"
                >
                  <div className="absolute -top-6 bg-orange-200 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white dark:border-neutral-950 z-10">
                    3
                  </div>
                  <img src={top3[2].avatar} alt={top3[2].name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-200 dark:border-orange-900/50 object-cover bg-white dark:bg-neutral-900 z-0" />
                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-900/30 w-full h-20 sm:h-24 mt-[-10px] rounded-t-xl flex flex-col items-center justify-end pb-3 px-2 text-center">
                    <span className="font-display font-bold text-xs sm:text-sm text-neutral-900 dark:text-white line-clamp-1 w-full">{top3[2].name}</span>
                    <span className="text-[10px] sm:text-xs text-primary font-bold">{top3[2].formattedValue}</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Rest of the list */}
            <div className="space-y-3">
              {rest.map((u, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  key={u.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${u.name === 'Tú' ? 'bg-primary/5 border-primary/20' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/5'}`}
                >
                  <div className="w-8 text-center font-display font-bold text-neutral-400">
                    #{index + 4}
                  </div>
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 object-cover" />
                  <div className="flex-grow">
                    <h4 className={`font-display font-bold ${u.name === 'Tú' ? 'text-primary' : 'text-neutral-900 dark:text-white'}`}>
                      {u.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">{u.formattedValue}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Call to action if not in ranking */}
      {!isCurrentUserInRanking && !seasonOver && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mx-4 sm:mx-6 mt-8 p-6 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-3xl border border-primary/20 text-center relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 text-primary/10 rotate-12">
            <Medal size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-white mb-2">
              ¿Quieres aparecer en el ranking?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6">
              Endulza tu vida con nuestros chocolates y acumula compras para subir de nivel.
            </p>
            <button 
              onClick={() => setActiveTab('home')}
              className="w-full py-3 bg-primary text-neutral-950 font-display font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Ir a comprar <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

