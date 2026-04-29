import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Split } from '../types/split.types';
import { formatCurrency } from '../utils/formatCurrency';

interface SplitCardProps {
  split: Split;
  currency?: string;
  onMarkPaid?: (split: Split) => void;
}

export const SplitCard: React.FC<SplitCardProps> = ({ split, currency = 'USD', onMarkPaid }) => {
  const isPaid = split.status === 'paid';
  const initials = split.memberName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, isPaid && styles.avatarPaid]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{split.memberName}</Text>
        <Text style={[styles.status, isPaid ? styles.statusPaid : styles.statusPending]}>
          {isPaid ? '✓ Paid' : '⏳ Pending'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(split.amount, currency)}</Text>
        {!isPaid && onMarkPaid && (
          <TouchableOpacity style={styles.payBtn} onPress={() => onMarkPaid(split)}>
            <Text style={styles.payBtnText}>Mark Paid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1B8FE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPaid: { backgroundColor: '#0EA472' },
  initials: { color: '#fff', fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1A2332' },
  status: { fontSize: 12, marginTop: 2 },
  statusPaid: { color: '#0EA472' },
  statusPending: { color: '#F59E0B' },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700', color: '#1A2332' },
  payBtn: {
    backgroundColor: 'rgba(14,164,114,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  payBtnText: { fontSize: 11, fontWeight: '600', color: '#0EA472' },
});