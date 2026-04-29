import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { pointsApi, PointsBalance, PointTransaction, Reward } from '../../api/points.api';

export default function PointsWalletScreen() {
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pointsApi.getMyBalance(),
      pointsApi.getTransactionHistory({ limit: 10 }),
      pointsApi.getRewards(),
    ]).then(([bal, txRes, rews]) => {
      setBalance(bal);
      setTransactions(txRes.transactions);
      setRewards(rews);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !balance) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Points Circle */}
      <View style={styles.headerGrad}>
        <View style={styles.pointsCircle}>
          <Text style={styles.pointsEmoji}>⭐</Text>
          <Text style={styles.pointsValue}>{balance.total}</Text>
          <Text style={styles.pointsLabel}>Total Points</Text>
        </View>
        <View style={styles.pointsRow}>
          <View style={styles.pointsStat}>
            <Text style={styles.pointsStatVal}>{balance.available}</Text>
            <Text style={styles.pointsStatLabel}>Available</Text>
          </View>
          <View style={styles.pointsStat}>
            <Text style={styles.pointsStatVal}>{balance.pending}</Text>
            <Text style={styles.pointsStatLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Rewards */}
      <Text style={styles.sectionTitle}>Rewards</Text>
      {rewards.map((r) => (
        <Card key={r.id} style={styles.rewardCard}>
          <View style={styles.rewardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardTitle}>{r.title}</Text>
              <Text style={styles.rewardDesc}>{r.description}</Text>
            </View>
            <View style={styles.redeemBtn}>
              <Text style={styles.redeemCost}>⭐ {r.pointsCost}</Text>
            </View>
          </View>
        </Card>
      ))}

      {/* History */}
      <Text style={styles.sectionTitle}>History</Text>
      {transactions.map((tx) => (
        <Card key={tx.id} style={styles.txRow}>
          <Text style={styles.txReason}>{tx.reason}</Text>
          <Text style={[styles.txAmount, tx.type === 'earn' ? styles.earn : styles.redeem]}>
            {tx.type === 'earn' ? '+' : '-'}{tx.amount} pts
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FAFE' },
  content: { gap: 14, paddingBottom: 80 },
  headerGrad: {
    backgroundColor: '#0EA472', paddingTop: 56, paddingBottom: 28,
    paddingHorizontal: 20, alignItems: 'center', gap: 20,
  },
  pointsCircle: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  pointsEmoji: { fontSize: 28 },
  pointsValue: { fontSize: 32, fontWeight: '800', color: '#fff' },
  pointsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  pointsRow: { flexDirection: 'row', gap: 40 },
  pointsStat: { alignItems: 'center' },
  pointsStatVal: { fontSize: 20, fontWeight: '700', color: '#fff' },
  pointsStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A2332', paddingHorizontal: 16 },
  rewardCard: { marginHorizontal: 16 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardTitle: { fontSize: 14, fontWeight: '600', color: '#1A2332' },
  rewardDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  redeemBtn: { backgroundColor: '#FFD700', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  redeemCost: { fontSize: 12, fontWeight: '700', color: '#1A2332' },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16 },
  txReason: { fontSize: 13, color: '#1A2332', flex: 1 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  earn: { color: '#0EA472' },
  redeem: { color: '#EF4444' },
});