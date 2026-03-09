import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context';
import { Trophy, Star, Gift, Crown, ArrowRight, Medal } from 'lucide-react';
import { CHOCOLATE_AVATARS } from '../utils';
import { useRanking } from '../hooks/useRanking';

type RankingTab = 'buyers' | 'points' | 'redemptions';

export function RankingPage() {
  const { user, setActiveTab, createSpecialOrder, startNewSeason, advancedConfig, claimSeasonPrize } = useApp();
  const [activeTab, setLocalTab] = useState<RankingTab>('buyers');
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const { loading, getRankingData, isSeasonOver, getRemainingTime, getHistoricalRecord } = useRanking();
  const seasonOver = isSeasonOver();
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());
  const historicalRecord = getHistoricalRecord(activeTab);

  useEffect(() => {
    if (seasonOver) return;
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [seasonOver]);

  const [records, setRecords] = useState({
    buyers: 0,
    points: 0,
    redemptions: 0
  });

  const rankingData = getRankingData(activeTab, user?.id);
  const buyersRanking = getRankingData('buyers', user?.id);
  const pointsRanking = getRankingData('points', user?.id);
  const redemptionsRanking = getRankingData('redemptions', user?.id);

  const currentKing = rankingData.length > 0 ? rankingData[0] : null;
  const isCurrentUserWinner = currentKing?.id === user?.id;

  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const hasSeenWinner = localStorage.getItem(`hasSeenWinnerAnimation_${currentMonth}`);
    if (!hasSeenWinner && isCurrentUserWinner) {
      setShowWinnerAnimation(true);
      setLocalTab('points'); // Force points tab on first load to show animation
    }
  }, [rankingData, user?.id, isCurrentUserWinner]);

  const handleCloseAnimation = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    localStorage.setItem(`hasSeenWinnerAnimation_${currentMonth}`, 'true');
    setShowWinnerAnimation(false);
  };

  const handleClaimAndClose = async () => {
    await claimSeasonPrize();
    handleCloseAnimation();
  };

  const handleRenewRanking = async () => {
    await startNewSeason();
    handleCloseAnimation();
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
      <AnimatePresence>
        {activeTab === 'points' && showWinnerAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-primary/20 to-orange-500/20 p-1 rounded-[3rem] max-w-sm w-full"
            >
              <div className="bg-neutral-900 rounded-[2.8rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
                />

                <Crown size={48} className="text-yellow-500 fill-yellow-500 mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                
                <h2 className="text-primary font-bold tracking-widest text-xs uppercase mb-2 relative z-10">
                  {seasonOver ? 'El mayor chocotejero de la temporada fue...' : 'Rey actual del ranking'}
                </h2>
                
                <div className="relative mb-6 mt-4 z-10">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-32 h-32 rounded-full border-4 border-primary p-1 bg-neutral-800 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                  >
                    <img src={currentKing?.avatar || CHOCOLATE_AVATARS[0]} alt={currentKing?.name || "Rey"} className="w-full h-full rounded-full object-cover" />
                  </motion.div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-neutral-950 font-bold px-4 py-1 rounded-full text-sm whitespace-nowrap shadow-lg">
                    {currentKing?.name || "Aún no hay rey"}
                  </div>
                </div>

                <p className="text-neutral-300 text-sm mb-8 relative z-10">
                  {isCurrentUserWinner && seasonOver
                    ? '¡Felicidades! Has ganado el derecho a crear tu propia chocoteja personalizada totalmente gratis.'
                    : seasonOver
                    ? `¡${currentKing?.name} ha ganado el derecho a crear su propia chocoteja personalizada totalmente gratis!`
                    : `¡${currentKing?.name} lidera el ranking actual! La temporada termina pronto.`}
                </p>

                {isCurrentUserWinner && seasonOver ? (
                  <button 
                    onClick={handleClaimAndClose}
                    className="w-full py-4 bg-primary text-neutral-950 font-bold font-display rounded-2xl hover:bg-primary/90 transition-colors relative z-10 shadow-lg shadow-primary/20 mb-3"
                  >
                    Reclamar y Renovar Ranking
                  </button>
                ) : (
                  <button 
                    onClick={handleRenewRanking}
                    className="w-full py-4 bg-primary text-neutral-950 font-bold font-display rounded-2xl hover:bg-primary/90 transition-colors relative z-10 shadow-lg shadow-primary/20"
                  >
                    {seasonOver ? 'Renovar Ranking' : 'Cerrar'}
                  </button>
                )}
                
                {isCurrentUserWinner && (
                  <button 
                    onClick={handleRenewRanking}
                    className="w-full py-3 text-neutral-400 font-bold font-display rounded-2xl hover:text-white transition-colors relative z-10"
                  >
                    Solo Renovar Ranking
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-6 bg-gradient-to-b from-primary/10 to-transparent">
        {/* Last Season Winner Banner */}
        {advancedConfig.lastSeasonWinner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-yellow-500/20 via-primary/20 to-yellow-500/20 border border-primary/30 p-4 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={advancedConfig.lastSeasonWinner.avatar} alt="Winner" className="w-12 h-12 rounded-full border-2 border-primary" />
                <Crown size={16} className="absolute -top-2 -right-1 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Rey de la Temporada Pasada</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{advancedConfig.lastSeasonWinner.name}</p>
              </div>
            </div>
            {user?.id === advancedConfig.lastSeasonWinner.id && !user.claimedSeasons?.includes(advancedConfig.lastSeasonWinner.seasonId) && (
              <button 
                onClick={claimSeasonPrize}
                className="px-4 py-2 bg-primary text-neutral-950 text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Reclamar Premio
              </button>
            )}
            {user?.id === advancedConfig.lastSeasonWinner.id && user.claimedSeasons?.includes(advancedConfig.lastSeasonWinner.seasonId) && (
              <div className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-500 text-[10px] font-bold rounded-xl">
                Premio Reclamado
              </div>
            )}
          </motion.div>
        )}

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

        {/* Corners Info */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-100 dark:border-white/5 mb-6">
          <div className="flex justify-between items-center mb-4">
            {/* Rey Actual - Left */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={currentKing?.avatar || CHOCOLATE_AVATARS[0]} alt="Winner" className="w-10 h-10 rounded-full border-2 border-primary" />
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-0.5 shadow-md">
                  <Crown size={10} className="text-white fill-white" />
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Rey Actual</p>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{currentKing?.name || 'N/A'}</p>
              </div>
            </div>

            {/* Record Histórico - Right */}
            <div className="text-right">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Récord Histórico</p>
              <p className="text-4xl font-display font-bold text-primary leading-none mt-1">
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
                  <div className="absolute -top-2 -right-1 bg-yellow-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    PREMIO
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {seasonOver ? (
        <div className="px-4 sm:px-6 mt-8">
          <h3 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-6 text-center">
            🏆 Reyes de la Temporada
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Points King (Most prominent) */}
            <div className="bg-gradient-to-br from-primary/20 to-orange-500/20 p-6 rounded-3xl border border-primary/20 text-center shadow-xl">
              <Crown size={48} className="text-yellow-500 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-1">Chokipoints</h4>
              <img src={pointsRanking[0]?.avatar || CHOCOLATE_AVATARS[0]} alt="King" className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-primary" />
              <p className="font-bold">{pointsRanking[0]?.name || 'N/A'}</p>
              <p className="text-sm text-neutral-500">{pointsRanking[0]?.formattedValue || '0 pts'}</p>
            </div>
            {/* Buyers King */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center">
              <Star size={40} className="text-blue-500 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-1">Compradores</h4>
              <img src={buyersRanking[0]?.avatar || CHOCOLATE_AVATARS[0]} alt="King" className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-blue-200" />
              <p className="font-bold">{buyersRanking[0]?.name || 'N/A'}</p>
              <p className="text-sm text-neutral-500">{buyersRanking[0]?.formattedValue || '0'}</p>
            </div>
            {/* Redemptions King */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center">
              <Gift size={40} className="text-green-500 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-1">Canjes</h4>
              <img src={redemptionsRanking[0]?.avatar || CHOCOLATE_AVATARS[0]} alt="King" className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-green-200" />
              <p className="font-bold">{redemptionsRanking[0]?.name || 'N/A'}</p>
              <p className="text-sm text-neutral-500">{redemptionsRanking[0]?.formattedValue || '0'}</p>
            </div>
          </div>
        </div>
      ) : (
        // ... (existing ranking list)
        <div className="px-4 sm:px-6">
          {/* Top 3 Pyramid */}
          <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8 mt-20 h-48">
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
                <div className="absolute -top-10 text-primary animate-bounce">
                  <Crown size={32} className="fill-primary" />
                </div>
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
        </div>
      )}

      {/* Call to action if not in ranking */}
      {!isCurrentUserInRanking && (
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
