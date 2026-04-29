// ScanBillScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { billsApi } from '../../api/bills.api';
import { ROUTES } from '../../constants/routes';

interface Props { navigation: NativeStackNavigationProp<any>; }

export default function ScanBillScreen({ navigation }: Props) {
  const [scanning, setScanning] = useState(false);

  const handleCapture = async () => {
    // In production: use react-native-camera or expo-camera to get imageUri
    const mockImageUri = 'file://mock/receipt.jpg';
    setScanning(true);
    try {
      const result = await billsApi.scanReceipt(mockImageUri);
      navigation.navigate(ROUTES.OCR_REVIEW, { ocrResult: result });
    } catch (err: any) {
      Alert.alert('Scan Failed', err.message || 'Could not process receipt. Try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan Receipt</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Camera Viewfinder */}
      <View style={styles.viewfinder}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
        <View style={styles.scanLine} />
        <Text style={styles.hint}>Align receipt within frame</Text>
      </View>

      <Text style={styles.subHint}>Make sure all text is visible and well-lit</Text>

      <View style={styles.captureArea}>
        <Button label={scanning ? 'Processing...' : '📸 Capture Receipt'} onPress={handleCapture} loading={scanning} />
      </View>
    </View>
  );
}

const CORNER = 20;
const BORDER = 3;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0F1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  viewfinder: {
    flex: 1, margin: 24, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: CORNER, height: CORNER, borderTopWidth: BORDER, borderLeftWidth: BORDER, borderColor: '#0EA472', borderTopLeftRadius: 2 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: CORNER, height: CORNER, borderTopWidth: BORDER, borderRightWidth: BORDER, borderColor: '#0EA472', borderTopRightRadius: 2 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: CORNER, height: CORNER, borderBottomWidth: BORDER, borderLeftWidth: BORDER, borderColor: '#0EA472', borderBottomLeftRadius: 2 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: CORNER, height: CORNER, borderBottomWidth: BORDER, borderRightWidth: BORDER, borderColor: '#0EA472', borderBottomRightRadius: 2 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#34D399', opacity: 0.8 },
  hint: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  subHint: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', paddingHorizontal: 32, marginBottom: 16 },
  captureArea: { padding: 24, paddingBottom: 40 },
});