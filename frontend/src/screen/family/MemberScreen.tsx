import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MemberCard } from '../../components/MemberCard';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { familyApi } from '../../api/family.api';
import { FamilyMember } from '../../types/family.types';

interface Props { navigation: NativeStackNavigationProp<any>; }

export default function MembersScreen({ navigation }: Props) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setError(null);
      const data = await familyApi.getMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleInvite = async () => {
    try {
      const { inviteCode } = await familyApi.inviteMember({ role: 'child' });
      Alert.alert('Invite Code', `Share this code: ${inviteCode}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={loadMembers} />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite}>
          <Text style={styles.inviteBtnText}>+ Invite</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(m) => m.userId}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMembers(); }} tintColor="#0EA472" />}
        renderItem={({ item }) => <MemberCard member={item} onPress={() => {}} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No members yet. Invite your family!</Text>}
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
  inviteBtn: { backgroundColor: '#0EA472', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  inviteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 14, marginTop: 40 },
});