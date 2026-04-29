import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { familyApi } from '../../api/family.api';
import { FamilyMember } from '../../types/family.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface ChildControl {
  memberId: string;
  name: string;
  spending: boolean;
  allowanceEnabled: boolean;
  allowanceAmount: number;
}

export default function ParentalControlScreen() {
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [controls, setControls] = useState<Record<string, ChildControl>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    familyApi.getMembers().then((members) => {
      const kids = members.filter((m) => m.role === 'child');
      setChildren(kids);
      const initial: Record<string, ChildControl> = {};
      kids.forEach((k) => {
        initial[k.userId] = {
          memberId: k.userId,
          name: k.name,
          spending: true,
          allowanceEnabled: false,
          allowanceAmount: 20,
        };
      });
      setControls(initial);
    }).finally(() => setLoading(false));
  }, []);

  const toggle = (memberId: string, key: keyof ChildControl) => {
    setControls((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [key]: !prev[memberId][key] },
    }));
  };

  if (loading) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>👨‍👩‍👧‍👦</Text>
        <Text style={styles.title}>Parental Controls</Text>
        <Text style={styles.subtitle}>Manage your children's spending & allowances</Text>
      </View>

      {children.length === 0 ? (
        <Card><Text style={styles.emptyText}>No children added yet. Invite them with an invite code and assign the child role.</Text></Card>
      ) : (
        children.map((child) => {
          const ctrl = controls[child.userId];
          if (!ctrl) return null;
          return (
            <Card key={child.userId} style={styles.childCard}>
              <View style={styles.childHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.initials}>{child.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childSpending}>Spent: {formatCurrency(child.monthlySpending)} this month</Text>
                </View>
                <Text style={styles.points}>⭐ {child.pointsBalance}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Spending Approval</Text>
                  <Text style={styles.toggleDesc}>Require approval for purchases</Text>
                </View>
                <Switch
                  value={ctrl.spending}
                  onValueChange={() => toggle(child.userId, 'spending')}
                  trackColor={{ true: '#0EA472', false: '#E2E8F0' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Weekly Allowance</Text>
                  <Text style={styles.toggleDesc}>{formatCurrency(ctrl.allowanceAmount)}/week</Text>
                </View>
                <Switch
                  value={ctrl.allowanceEnabled}
                  onValueChange={() => toggle(child.userId, 'allowanceEnabled')}
                  trackColor={{ true: '#0EA472', false: '#E2E8F0' }}
                  thumbColor="#fff"
                />
              </View>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FAFE' },
  content: { gap: 14, padding: 16, paddingBottom: 80 },
  header: { alignItems: 'center', gap: 8, paddingTop: 32, paddingBottom: 8 },
  headerEmoji: { fontSize: 48 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A2332' },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  childCard: { gap: 12 },
  childHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1B8FE0', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  childName: { fontSize: 16, fontWeight: '700', color: '#1A2332' },
  childSpending: { fontSize: 12, color: '#94A3B8' },
  points: { fontSize: 13, color: '#F59E0B', fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#1A2332' },
  toggleDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 14, lineHeight: 22 },
});