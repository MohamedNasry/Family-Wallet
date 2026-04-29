import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FamilyMember } from '../types/family.types';
import { formatCurrency } from '../utils/formatCurrency';

interface MemberCardProps {
  member: FamilyMember;
  onPress?: (member: FamilyMember) => void;
  currency?: string;
}

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  parent: { label: 'Parent', color: '#1260A8', bg: '#EBF4FD' },
  child: { label: 'Child', color: '#6D28D9', bg: '#F3EEFE' },
  admin: { label: 'Admin', color: '#0B7A56', bg: '#E8F8F0' },
};

export const MemberCard: React.FC<MemberCardProps> = ({ member, onPress, currency = 'USD' }) => {
  const badge = ROLE_BADGE[member.role] ?? ROLE_BADGE.child;
  const initials = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(member)}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{member.name}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.spending}>{formatCurrency(member.monthlySpending, currency)}</Text>
        <Text style={styles.spendingLabel}>this month</Text>
        <Text style={styles.points}>⭐ {member.pointsBalance} pts</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA472',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: '600', color: '#1A2332' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 2 },
  spending: { fontSize: 15, fontWeight: '700', color: '#1A2332' },
  spendingLabel: { fontSize: 11, color: '#94A3B8' },
  points: { fontSize: 12, color: '#F59E0B', fontWeight: '600', marginTop: 2 },
});