import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';
import { RANKING_START_DATE } from '../constants';

export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  value: number;
  formattedValue: string;
}

export const useRanking = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getRankingData = (activeTab: 'buyers' | 'points' | 'redemptions', currentUserId?: string): RankingUser[] => {
    let data: RankingUser[] = [];

    const activeUsers = users.filter(u => u.email && u.email.trim() !== '' && !u.name.toLowerCase().includes('eliminad'));

    if (activeTab === 'buyers') {
      data = activeUsers.map(u => {
        const completedOrders = u.history.filter(o => 
          o.status === 'completed' && 
          !o.isRedemption && 
          new Date(o.date) >= new Date(RANKING_START_DATE)
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
          .filter(tx => new Date(tx.date) >= new Date(RANKING_START_DATE) && tx.amount > 0)
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
        const redemptions = u.history.filter(o => 
          o.status === 'completed' && 
          o.isRedemption &&
          new Date(o.date) >= new Date(RANKING_START_DATE)
        ).length;
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

  return { loading, getRankingData };
};
