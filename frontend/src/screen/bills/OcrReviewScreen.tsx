import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { billsApi } from '../../api/bills.api';
import { OcrResult } from '../../types/ocr.types';
import { ROUTES } from '../../constants/routes';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ OcrReview: { ocrResult: OcrResult } }, 'OcrReview'>;
}

export default function OcrReviewScreen({ navigation, route }: Props) {
  const { ocrResult } = route.params;
  const [merchantName, setMerchantName] = useState(ocrResult.merchantName ?? '');
  const [totalAmount, setTotalAmount] = useState(String(ocrResult.totalAmount ?? ''));
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const bill = await billsApi.confirmOcr(ocrResult.id, {
        merchantName,
        totalAmount: parseFloat(totalAmount),
      });
      navigation.navigate(ROUTES.SPLIT_BILL, { billId: bill.id });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to confirm receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review Receipt</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="green">
          <Text style={styles.successLabel}>✅ Receipt scanned successfully</Text>
          <Text style={styles.confidence}>Confidence: {Math.round(ocrResult.confidence * 100)}%</Text>
        </Card>

        <Input label="Merchant Name" value={merchantName} onChangeText={setMerchantName} placeholder="Store / Restaurant name" />
        <Input label="Total Amount" value={totalAmount} onChangeText={setTotalAmount} keyboardType="decimal-pad" placeholder="0.00" />

        {ocrResult.lineItems.length > 0 && (
          <Card>
            <Text style={styles.lineTitle}>Line Items</Text>
            {ocrResult.lineItems.map((item, i) => (
              <View key={i} style={styles.lineRow}>
                <Text style={styles.lineName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.linePrice}>${item.totalPrice.toFixed(2)}</Text>
              </View>
            ))}
          </Card>
        )}

        <Button label="Confirm & Split →" onPress={handleConfirm} loading={loading} />
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
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { padding: 16, gap: 16, paddingBottom: 60 },
  successLabel: { fontSize: 14, fontWeight: '600', color: '#0EA472' },
  confidence: { fontSize: 12, color: '#64748B', marginTop: 2 },
  lineTitle: { fontSize: 14, fontWeight: '700', color: '#1A2332', marginBottom: 12 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  lineName: { flex: 1, fontSize: 13, color: '#1A2332' },
  linePrice: { fontSize: 13, fontWeight: '600', color: '#1A2332' },
});