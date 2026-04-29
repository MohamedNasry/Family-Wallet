import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authApi } from '../../api/auth.api';
import { tokenStorage } from '../../utils/tokenStorage';
import { ROUTES } from '../../constants/routes';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.DASHBOARD }] });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Set up your family wallet today</Text>
        </View>

        <View style={styles.form}>
          <Input label="Full Name" placeholder="Sarah Hassan" value={form.name} onChangeText={set('name')} error={errors.name} />
          <Input label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} error={errors.email} />
          <Input label="Password" placeholder="••••••••" secureTextEntry={!showPassword} value={form.password} onChangeText={set('password')} error={errors.password}
            rightIcon={<Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>}
            onRightIconPress={() => setShowPassword((v) => !v)}
          />
          <Input label="Confirm Password" placeholder="••••••••" secureTextEntry={!showPassword} value={form.confirmPassword} onChangeText={set('confirmPassword')} error={errors.confirmPassword} />

          <Button label="Create Account" onPress={handleRegister} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)} style={styles.loginLink}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.link}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7FAFE' },
  container: { flexGrow: 1, padding: 24, gap: 28 },
  header: { paddingTop: 48, gap: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A2332' },
  subtitle: { fontSize: 15, color: '#64748B' },
  form: { gap: 16 },
  eyeIcon: { fontSize: 18 },
  loginLink: { alignItems: 'center', paddingBottom: 32 },
  loginText: { fontSize: 14, color: '#64748B' },
  link: { color: '#0EA472', fontWeight: '600' },
});