import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { BillCard } from '../../components/BillCard';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { billsApi } from '../../api/bills.api';
import { familyApi } from '../../api/family.api';
import { Bill } from '../../types/bill.types';
import { Family } from '../../types/family.types';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCurrentMonthRange } from '../../utils/formatDate';
import { ROUTES } from '../../constants/routes';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function DashboardScreen({ navigation }: Props) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalExpenses = bills.reduce((sum, b) => sum + b.amount, 0);
  const remaining = (family?.monthlyBudget ?? 0) - totalExpenses;

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const { startDate, endDate } = getCurrentMonthRange();
      const [billsRes, familyRes] = await Promise.all([
        billsApi.getBills({ limit: 5, startDate, endDate }),
        familyApi.getMyFamily(),
      ]);
      setBills(billsRes.bills);
      setFamily(familyRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) return <Loading fullScreen message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  const currency = family?.currency ?? 'USD';

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA472" />}
    >
      {/* Gradient Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.familyName}>{family?.name ?? 'My Family'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>Monthly Budget</Text>
          <Text style={styles.budgetAmount}>{formatCurrency(family?.monthlyBudget ?? 0, currency)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, {
                width: `${Math.min(100, (totalExpenses / (family?.monthlyBudget ?? 1)) * 100)}%`,
              }]}
            />
          </View>
          <Text style={styles.budgetSub}>{formatCurrency(totalExpenses, currency)} spent this month</Text>
        </View>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { borderLeftColor: '#EF4444', borderLeftWidth: 3 }]}>
          <Text style={styles.summaryIcon}>📉</Text>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalExpenses, currency)}</Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftColor: '#0EA472', borderLeftWidth: 3 }]}>
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text style={[styles.summaryValue, { color: '#0EA472' }]}>{formatCurrency(remaining, currency)}</Text>
        </Card>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.BILLS)}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        <Card>
          {bills.length === 0 ? (
            <Text style={styles.emptyText}>No transactions this month</Text>
          ) : (
            bills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPress={(b) => navigation.navigate(ROUTES.BILL_DETAILS, { billId: b.id })}
              />
            ))
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FAFE' },
  header: {
    background: undefined,
    backgroundColor: '#0EA472',
    padding: 20,
    paddingTop: 56,
    paddingBottom: 28,
    gap: 16,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  familyName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  budgetCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 16, gap: 8,
  },
  budgetLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  budgetAmount: { fontSize: 28, fontWeight: '800', color: '#fff' },
  progressBar: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 10 },
  budgetSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  summaryRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, marginTop: -14, marginBottom: 14,
  },
  summaryCard: { flex: 1, gap: 4 },
  summaryIcon: { fontSize: 18, marginBottom: 4 },
  summaryLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#1A2332' },
  section: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A2332' },
  seeAll: { fontSize: 13, color: '#0EA472', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: 16 },
});