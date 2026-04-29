import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authApi } from '../../api/auth.api';
import { tokenStorage } from '../../utils/tokenStorage';
import { ROUTES } from '../../constants/routes';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route?: { params?: { inviteCode?: string } };
}

export default function JoinWithInviteScreen({ navigation, route }: Props) {
  const [form, setForm] = useState({
    inviteCode: route?.params?.inviteCode ?? '',
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.inviteCode) e.inviteCode = 'Invite code is required';
    if (!form.name) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleJoin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.joinWithInvite(form);
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.DASHBOARD }] });
    } catch (err: any) {
      Alert.alert('Failed to Join', err.message || 'Invalid invite code or please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={styles.title}>Join Your Family</Text>
          <Text style={styles.subtitle}>Enter the invite code shared by your family admin</Text>
        </View>

        <View style={styles.form}>
          <Input label="Invite Code" placeholder="e.g. FAM-A1B2C3" autoCapitalize="characters" value={form.inviteCode} onChangeText={set('inviteCode')} error={errors.inviteCode} />
          <Input label="Your Name" placeholder="John Hassan" value={form.name} onChangeText={set('name')} error={errors.name} />
          <Input label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} error={errors.email} />
          <Input label="Create Password" placeholder="••••••••" secureTextEntry value={form.password} onChangeText={set('password')} error={errors.password} />

          <Button label="Join Family 🎉" onPress={handleJoin} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7FAFE' },
  container: { flexGrow: 1, padding: 24, gap: 28 },
  hero: { alignItems: 'center', paddingTop: 48, gap: 10 },
  heroEmoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A2332' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  form: { gap: 16 },
});