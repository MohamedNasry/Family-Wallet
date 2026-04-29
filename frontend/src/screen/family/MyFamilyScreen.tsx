import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { familyApi } from '../../api/family.api';
import { Family } from '../../types/family.types';
import { formatCurrency } from '../../utils/formatCurrency';

export default function MyFamilyScreen() {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    familyApi.getMyFamily().then(setFamily).finally(() => setLoading(false));
  }, []);

  const handleShareInvite = () => {
    if (family?.inviteCode) {
      Alert.alert('Invite Code', `Share this with family members:\n\n${family.inviteCode}`);
    }
  };

  if (loading || !family) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.familyEmoji}>🏠</Text>
        <Text style={styles.familyName}>{family.name}</Text>
        <Text style={styles.familyCurrency}>{family.currency}</Text>
      </View>

      <Card variant="green">
        <Text style={styles.cardLabel}>Monthly Budget</Text>
        <Text style={styles.cardValue}>{formatCurrency(family.monthlyBudget ?? 0, family.currency)}</Text>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Invite Code</Text>
        <Text style={styles.inviteCode}>{family.inviteCode}</Text>
        <Button label="Share Invite Code 🔗" onPress={handleShareInvite} variant="secondary" style={{ marginTop: 12 }} />
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Family Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Family ID</Text>
          <Text style={styles.infoVal}>{family.id.slice(0, 8)}...</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Currency</Text>
          <Text style={styles.infoVal}>{family.currency}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Created</Text>
          <Text style={styles.infoVal}>{new Date(family.createdAt).toLocaleDateString()}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FAFE' },
  content: { padding: 16, gap: 16, paddingBottom: 60 },
  header: {
    alignItems: 'center', gap: 8, paddingTop: 48, paddingBottom: 16,
    backgroundColor: '#0EA472', marginHorizontal: -16, marginTop: -16,
    paddingHorizontal: 16,
  },
  familyEmoji: { fontSize: 56 },
  familyName: { fontSize: 26, fontWeight: '800', color: '#fff' },
  familyCurrency: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#0EA472' },
  inviteCode: { fontSize: 22, fontWeight: '800', color: '#1A2332', letterSpacing: 2, textAlign: 'center', marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoKey: { fontSize: 13, color: '#64748B' },
  infoVal: { fontSize: 13, fontWeight: '600', color: '#1A2332' },
});