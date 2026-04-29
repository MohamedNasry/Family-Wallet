import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { billsApi } from '../../api/bills.api';
import { categoriesApi } from '../../api/categories.api';
import { familyApi } from '../../api/family.api';
import { Category } from '../../types/category.types';
import { FamilyMember } from '../../types/family.types';
import { ROUTES } from '../../constants/routes';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function AddBillScreen({ navigation }: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'manual' | 'scan'>('manual');

  useEffect(() => {
    Promise.all([categoriesApi.getCategories(), familyApi.getMembers()]).then(
      ([cats, mems]) => { setCategories(cats); setMembers(mems); }
    );
  }, []);

  const handleSubmit = async () => {
    if (!amount || !selectedCategory || !selectedMember) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const bill = await billsApi.createBill({
        title: note || 'Expense',
        amount: parseFloat(amount),
        currency: 'USD',
        categoryId: selectedCategory,
        paidById: selectedMember,
        note,
      });
      navigation.navigate(ROUTES.SPLIT_BILL, { billId: bill.id });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tab, tab === 'manual' && styles.tabActive]} onPress={() => setTab('manual')}>
            <Text style={[styles.tabText, tab === 'manual' && styles.tabTextActive]}>✍️ Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'scan' && styles.tabActive]} onPress={() => navigation.navigate(ROUTES.SCAN_BILL)}>
            <Text style={[styles.tabText, tab === 'scan' && styles.tabTextActive]}>📷 Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>$</Text>
            <Input
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              style={styles.amountInput}
            />
          </View>
        </Card>

        {/* Category */}
        <View>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.catGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catPill}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View style={[
                  styles.catCircle,
                  { backgroundColor: cat.color + '20' },
                  selectedCategory === cat.id && styles.catSelected,
                ]}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                </View>
                <Text style={styles.catLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Paid By */}
        <View>
          <Text style={styles.fieldLabel}>Paid By</Text>
          <View style={styles.memberRow}>
            {members.map((m) => {
              const initials = m.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
              return (
                <TouchableOpacity
                  key={m.userId}
                  style={[styles.memberChip, selectedMember === m.userId && styles.memberChipSelected]}
                  onPress={() => setSelectedMember(m.userId)}
                >
                  <Text style={styles.memberInitials}>{initials}</Text>
                  <Text style={[styles.memberName, selectedMember === m.userId && styles.memberNameSelected]}>
                    {m.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Note */}
        <Input label="Note (optional)" placeholder="What was this for?" value={note} onChangeText={setNote} />

        <Button label="Continue to Split →" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7FAFE' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#0EA472',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  container: { padding: 16, gap: 20, paddingBottom: 60 },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#EDF2F7',
    borderRadius: 12, padding: 3, gap: 2,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  tabTextActive: { fontWeight: '600', color: '#1A2332' },
  amountCard: { alignItems: 'center', gap: 6 },
  amountLabel: { fontSize: 13, color: '#94A3B8' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  currency: { fontSize: 28, color: '#64748B' },
  amountInput: { fontSize: 52, fontWeight: '800', color: '#1A2332', borderWidth: 0, backgroundColor: 'transparent', width: 180 } as any,
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catPill: { alignItems: 'center', gap: 6, width: 60 },
  catCircle: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catSelected: { borderWidth: 2, borderColor: '#0EA472' },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 11, color: '#64748B', textAlign: 'center' },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F7FAFE', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50, paddingHorizontal: 12, paddingVertical: 8,
  },
  memberChipSelected: { borderColor: '#0EA472', backgroundColor: '#E8F8F0' },
  memberInitials: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#0EA472', color: '#fff',
    textAlign: 'center', lineHeight: 26, fontWeight: '700', fontSize: 11,
  },
  memberName: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  memberNameSelected: { color: '#0EA472', fontWeight: '600' },
});