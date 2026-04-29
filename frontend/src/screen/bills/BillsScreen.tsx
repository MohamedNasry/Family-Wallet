import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BillCard } from '../../components/BillCard';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { billsApi } from '../../api/bills.api';
import { Bill } from '../../types/bill.types';
import { ROUTES } from '../../constants/routes';

type Filter = 'all' | 'pending' | 'paid';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function BillsScreen({ navigation }: Props) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBills = useCallback(async () => {
    try {
      setError(null);
      const res = await billsApi.getBills({ limit: 50 });
      setBills(res.bills);
    } catch (err: any) {
      setError(err.message || 'Failed to load bills');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadBills(); }, [loadBills]);

  const filtered = filter === 'all' ? bills : bills.filter((b) => b.status === filter);

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={loadBills} />;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bills</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate(ROUTES.ADD_BILL)}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {(['all', 'pending', 'paid'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBills(); }} tintColor="#0EA472" />
        }
        renderItem={({ item }) => (
          <BillCard
            bill={item}
            onPress={(b) => navigation.navigate(ROUTES.BILL_DETAILS, { billId: b.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {filter === 'all' ? '' : filter} bills found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FAFE' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1A2332' },
  addBtn: {
    backgroundColor: '#0EA472', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#EDF2F7',
    margin: 16, borderRadius: 12, padding: 3, gap: 2,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  tabTextActive: { color: '#1A2332', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 0 },
  emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 14, marginTop: 40 },
});