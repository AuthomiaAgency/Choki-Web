import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';
import { useApp } from '../context';
import { RANKING_START_DATE } from '../constants';

export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  value: number;
  formattedValue: string;
}

export const useRanking = () => {
  const { advancedConfig } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const seasonStartDate = advancedConfig?.seasonStartDate || RANKING_START_DATE;
  const seasonEndDate = advancedConfig?.seasonEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'client'));
        const snap = await getDocs(q);
        const fetchedUsers = snap.docs.map(d => d.data() as User);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users for ranking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const isSeasonOver = () => {
    const end = new Date(seasonEndDate);
    const now = new Date();
    return now.getTime() >= end.getTime();
  };

  const getRemainingTime = () => {
    const end = new Date(seasonEndDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getRankingData = (activeTab: 'buyers' | 'points' | 'redemptions', currentUserId?: string): RankingUser[] => {
    let data: RankingUser[] = [];

    const activeUsers = users.filter(u => u.email && u.email.trim() !== '' && !u.name.toLowerCase().includes('eliminad'));

    if (activeTab === 'buyers') {
      data = activeUsers.map(u => {
        const completedOrders = u.history.filter(o => 
          o.status === 'completed' && 
          !o.isRedemption && 
          new Date(o.date) >= new Date(seasonStartDate)
        );
        const totalItems = completedOrders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        return {
          id: u.id,
          name: u.id === currentUserId ? 'Tú' : u.name,
          avatar: u.avatar,
          value: totalItems,
          formattedValue: `${totalItems} chocotejas`
        };
      });
    } else if (activeTab === 'points') {
      data = activeUsers.map(u => {
        const pointsEarned = (u.pointHistory || [])
          .filter(tx => new Date(tx.date) >= new Date(seasonStartDate) && tx.type !== 'spent')
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        return {
          id: u.id,
          name: u.id === currentUserId ? 'Tú' : u.name,
          avatar: u.avatar,
          value: pointsEarned,
          formattedValue: `${pointsEarned} pts`
        };
      });
    } else if (activeTab === 'redemptions') {
      data = activeUsers.map(u => {
        const completedRedemptions = u.history.filter(o => 
          o.status === 'completed' && 
          o.isRedemption &&
          new Date(o.date) >= new Date(seasonStartDate)
        );
        const redemptions = completedRedemptions.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        return {
          id: u.id,
          name: u.id === currentUserId ? 'Tú' : u.name,
          avatar: u.avatar,
          value: redemptions,
          formattedValue: `${redemptions} canjes`
        };
      });
    }

    return data.filter(u => u.value > 0).sort((a, b) => b.value - a.value);
  };

  const getHistoricalRecord = (activeTab: 'buyers' | 'points' | 'redemptions') => {
    const data = getRankingData(activeTab);
    if (data.length === 0) return null;
    // Since we want the record from this season onwards, the record is the top value in the current ranking
    const top = data[0];
    return {
      name: top.name === 'Tú' ? 'Tú' : top.name,
      value: top.value,
      formattedValue: top.formattedValue,
      avatar: top.avatar
    };
  };

  return { loading, getRankingData, isSeasonOver, getRemainingTime, getHistoricalRecord };
};
