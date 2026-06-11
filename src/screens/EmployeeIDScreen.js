import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const FIRE_RED = '#B22222';
const DARK_GRAY = '#333';

export default function EmployeeIDScreen({ navigation }) {
  const [employeeId, setEmployeeId] = useState('');
  const [station, setStation] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setEmployeeId(data);
    setScanMode(false);
    Alert.alert('Badge Scanned', `Employee ID: ${data}`);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Enable camera access in Settings to scan barcodes.');
        return;
      }
    }
    setScanned(false);
    setScanMode(true);
  };

  const handleContinue = () => {
    const id = employeeId.trim();
    if (!id) {
      Alert.alert('Employee ID Required', 'Enter or scan your Employee ID before continuing.');
      return;
    }
    navigation.navigate('GearScan', { employeeId: id, station: station.trim() });
  };

  // ── Barcode scanner view ──────────────────────────────────
  if (scanMode) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'code128', 'code39', 'pdf417', 'ean13', 'ean8'],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>Aim at your badge barcode or QR code</Text>
        </View>
        <TouchableOpacity style={styles.cancelScanBtn} onPress={() => setScanMode(false)}>
          <Text style={styles.cancelScanText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main screen ───────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>🔥</Text>
        </View>
        <Text style={styles.title}>Firefighter Check-In</Text>
        <Text style={styles.subtitle}>Enter your Employee ID or scan your badge.</Text>

        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. FF-12345"
          placeholderTextColor="#aaa"
          value={employeeId}
          onChangeText={setEmployeeId}
          autoCapitalize="characters"
          returnKeyType="next"
        />

        <TouchableOpacity style={styles.scanBtn} onPress={openScanner}>
          <Text style={styles.scanBtnText}>📷  Scan Badge Barcode / QR</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 20 }]}>Station (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Station 7"
          placeholderTextColor="#aaa"
          value={station}
          onChangeText={setStation}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        <TouchableOpacity
          style={[styles.continueBtn, !employeeId.trim() && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!employeeId.trim()}
        >
          <Text style={styles.continueBtnText}>Continue to Gear Scan →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12, borderWidth: 2, borderColor: '#B22222' }}
          onPress={() => navigation.navigate('Checklist')}
        >
          <Text style={{ color: '#B22222', fontSize: 16, fontWeight: '700' }}>✅ NFPA 1850 Checklist</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 28, paddingTop: 40, alignItems: 'stretch' },
  iconWrap: {
    alignSelf: 'center', backgroundColor: FIRE_RED,
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  iconText: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: '700', color: DARK_GRAY, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: DARK_GRAY, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 16,
    color: DARK_GRAY, backgroundColor: '#f5f5f5', marginBottom: 12,
  },
  scanBtn: {
    borderWidth: 1.5, borderColor: FIRE_RED, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginBottom: 4,
  },
  scanBtnText: { fontSize: 15, color: FIRE_RED, fontWeight: '600' },
  continueBtn: {
    backgroundColor: FIRE_RED, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 32, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3,
  },
  continueBtnDisabled: { backgroundColor: '#ccc', elevation: 0, shadowOpacity: 0 },
  continueBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  // Scanner
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 260, height: 160, borderWidth: 3, borderColor: '#fff',
    borderRadius: 12, backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#fff', marginTop: 20, fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  cancelScanBtn: {
    position: 'absolute', bottom: 50, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: '#fff',
    borderRadius: 30, paddingHorizontal: 36, paddingVertical: 12,
  },
  cancelScanText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
