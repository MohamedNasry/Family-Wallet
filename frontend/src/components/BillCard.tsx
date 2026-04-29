import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bill } from '../types/bill.types';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const STATUS_COLORS: Record<string, string> = {
  paid: '#0EA472',
  pending: '#F59E0B',
  partial: '#1B8FE0',
  cancelled: '#94A3B8',
};

interface BillCardProps {
  bill: Bill;
  onPress: (bill: Bill) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={() => onPress(bill)} activeOpacity={0.8}>
    <View style={styles.iconBox}>
      <Text style={styles.emoji}>{bill.categoryEmoji}</Text>
    </View>
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={1}>{bill.title}</Text>
      <Text style={styles.meta}>
        {bill.paidByName} · {formatDate(bill.createdAt, 'relative')}
      </Text>
    </View>
    <View style={styles.right}>
      <Text style={styles.amount}>{formatCurrency(bill.amount, bill.currency)}</Text>
      <Text style={[styles.status, { color: STATUS_COLORS[bill.status] }]}>
        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 18 },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#1A2332' },
  meta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700', color: '#1A2332' },
  status: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});