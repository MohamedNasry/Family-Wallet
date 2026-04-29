import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { billsApi } from '../../api/bills.api';
import { splitsApi } from '../../api/splits.api';
import { familyApi } from '../../api/family.api';
import { Bill } from '../../types/bill.types';
import { FamilyMember } from '../../types/family.types';
import { SplitMethod } from '../../types/split.types';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../constants/routes';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ SplitBill: { billId: string } }, 'SplitBill'>;
}

const METHODS: { id: SplitMethod; label: string; desc: string }[] = [
  { id: 'equal', label: '⚖️ Equal Split', desc: 'Divide equally among selected members' },
  { id: 'percentage', label: '📊 By Percentage', desc: 'Custom percentage per member' },
  { id: 'custom', label: '✏️ Custom Amount', desc: 'Specify exact amount per member' },
];

export default function SplitBillScreen({ navigation, route }: Props) {
  const { billId } = route.params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [method, setMethod] = useState<SplitMethod>('equal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([billsApi.getBill(billId), familyApi.getMembers()]).then(
      ([b, m]) => {
        setBill(b);
        setMembers(m);
        setSelected(new Set(m.map((mem) => mem.userId)));
      }
    ).finally(() => setLoading(false));
  }, [billId]);

  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSplit = async () => {
    if (selected.size === 0) {
      Alert.alert('Select Members', 'Please select at least one member');
      return;
    }
    setSaving(true);
    try {
      await splitsApi.createSplit(billId, {
        method,
        members: [...selected].map((id) => ({ memberId: id })),
      });
      navigation.navigate(ROUTES.BILL_DETAILS, { billId });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to split bill');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !bill) return <Loading fullScreen />;

  const perPerson = selected.size > 0 ? bill.amount / selected.size : 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Split Bill</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Bill summary */}
        <Card variant="green">
          <Text style={styles.billName}>{bill.title}</Text>
          <Text style={styles.billTotal}>{formatCurrency(bill.amount, bill.currency)}</Text>
          {method === 'equal' && selected.size > 0 && (
            <Text style={styles.perPerson}>
              {formatCurrency(perPerson, bill.currency)} per person
            </Text>
          )}
        </Card>

        {/* Split method */}
        <Text style={styles.sectionLabel}>Split Method</Text>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodCard, method === m.id && styles.methodCardActive]}
            onPress={() => setMethod(m.id)}
          >
            <Text style={styles.methodLabel}>{m.label}</Text>
            <Text style={styles.methodDesc}>{m.desc}</Text>
          </TouchableOpacity>
        ))}

        {/* Members */}
        <Text style={styles.sectionLabel}>Select Members</Text>
        {members.map((m) => {
          const isSelected = selected.has(m.userId);
          const initials = m.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
          return (
            <TouchableOpacity
              key={m.userId}
              style={[styles.memberRow, isSelected && styles.memberRowSelected]}
              onPress={() => toggleMember(m.userId)}
            >
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.check}>{isSelected ? '✓' : ''}</Text>
            </TouchableOpacity>
          );
        })}

        <Button label={`Split Among ${selected.size} Members`} onPress={handleSplit} loading={saving} />
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
  content: { padding: 16, gap: 14, paddingBottom: 60 },
  billName: { fontSize: 16, fontWeight: '600', color: '#1A2332' },
  billTotal: { fontSize: 28, fontWeight: '800', color: '#0EA472' },
  perPerson: { fontSize: 13, color: '#64748B' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 },
  methodCard: {
    backgroundColor: '#F7FAFE', borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 14, padding: 14, gap: 3,
  },
  methodCardActive: { backgroundColor: '#E8F8F0', borderColor: '#0EA472' },
  methodLabel: { fontSize: 14, fontWeight: '600', color: '#1A2332' },
  methodDesc: { fontSize: 12, color: '#64748B' },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  memberRowSelected: { borderColor: '#0EA472', backgroundColor: '#E8F8F0' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#94A3B8', alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { backgroundColor: '#0EA472' },
  initials: { color: '#fff', fontWeight: '700', fontSize: 13 },
  memberName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1A2332' },
  check: { fontSize: 16, color: '#0EA472', fontWeight: '700' },
});