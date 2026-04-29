import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { SplitCard } from '../../components/SplitCard';
import { Loading } from '../../components/Loading';
import { billsApi } from '../../api/bills.api';
import { splitsApi } from '../../api/splits.api';
import { Bill } from '../../types/bill.types';
import { Split } from '../../types/split.types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ROUTES } from '../../constants/routes';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ BillDetails: { billId: string } }, 'BillDetails'>;
}

export default function BillDetailsScreen({ navigation, route }: Props) {
  const { billId } = route.params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([billsApi.getBill(billId), splitsApi.getSplitsForBill(billId)]).then(
      ([b, s]) => { setBill(b); setSplits(s); }
    ).finally(() => setLoading(false));
  }, [billId]);

  const handleMarkPaid = async (split: Split) => {
    try {
      const updated = await splitsApi.markSplitPaid(split.id);
      setSplits((prev) => prev.map((s) => (s.id === split.id ? updated : s)));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Bill', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await billsApi.deleteBill(billId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading || !bill) return <Loading fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <Text style={styles.emoji}>{bill.categoryEmoji}</Text>
          <Text style={styles.billTitle}>{bill.title}</Text>
          <Text style={styles.amount}>{formatCurrency(bill.amount, bill.currency)}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>Paid by {bill.paidByName}</Text>
            <Text style={styles.meta}>{formatDate(bill.createdAt, 'long')}</Text>
          </View>
          {bill.note && <Text style={styles.note}>{bill.note}</Text>}
        </Card>

        {splits.length > 0 && (
          <Card>
            <Text style={styles.splitTitle}>Split ({splits.length} members)</Text>
            {splits.map((split) => (
              <SplitCard
                key={split.id}
                split={split}
                currency={bill.currency}
                onMarkPaid={handleMarkPaid}
              />
            ))}
          </Card>
        )}

        <TouchableOpacity
          style={styles.resplitBtn}
          onPress={() => navigation.navigate(ROUTES.SPLIT_BILL, { billId })}
        >
          <Text style={styles.resplitText}>⚖️ Re-split Bill</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FAFE' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#0EA472',
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  deleteIcon: { fontSize: 20 },
  content: { padding: 16, gap: 16, paddingBottom: 60 },
  mainCard: { alignItems: 'center', gap: 8 },
  emoji: { fontSize: 48 },
  billTitle: { fontSize: 20, fontWeight: '700', color: '#1A2332' },
  amount: { fontSize: 36, fontWeight: '800', color: '#0EA472' },
  metaRow: { gap: 4, alignItems: 'center' },
  meta: { fontSize: 13, color: '#94A3B8' },
  note: { fontSize: 14, color: '#64748B', fontStyle: 'italic', textAlign: 'center' },
  splitTitle: { fontSize: 16, fontWeight: '700', color: '#1A2332', marginBottom: 8 },
  resplitBtn: {
    borderWidth: 1.5, borderColor: '#0EA472', borderRadius: 50,
    paddingVertical: 14, alignItems: 'center',
  },
  resplitText: { fontSize: 15, fontWeight: '600', color: '#0EA472' },
});