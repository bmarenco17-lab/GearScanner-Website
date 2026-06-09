import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { analyzeGearLabel, emptyGearRecord } from '../services/claudeService';

const FIRE_RED = '#B22222';
const DARK_GRAY = '#333';

export default function GearScanScreen({ route, navigation }) {
  const { employeeId, station } = route.params;
  const cameraRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Enable camera access in Settings to photograph labels.');
        return;
      }
    }
    setCameraOpen(true);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true, quality: 0.85, exif: false,
      });
      setPhotoUri(photo.uri);
      setPhotoBase64(photo.base64);
      setCameraOpen(false);
    } catch (err) {
      Alert.alert('Camera Error', err.message);
    }
  };

  const analyzePhoto = async () => {
    if (!photoBase64) return;
    setAnalyzing(true);
    try {
      const extracted = await analyzeGearLabel(photoBase64);
      navigation.navigate('Review', { employeeId, station, gearData: extracted, photoUri });
    } catch (err) {
      Alert.alert('Analysis Failed', err.message + '\n\nCheck your Anthropic API key in src/config/constants.js');
    } finally {
      setAnalyzing(false);
    }
  };

  const skipToManual = () => {
    navigation.navigate('Review', { employeeId, station, gearData: emptyGearRecord(), photoUri: null });
  };

  // ── Camera view ───────────────────────────────────────────
  if (cameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
        <View style={styles.cameraOverlay}>
          <View style={styles.labelFrame} />
          <Text style={styles.cameraHint}>Center the gear label in the frame</Text>
        </View>
        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setCameraOpen(false)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <View style={{ width: 70 }} />
        </View>
      </View>
    );
  }

  // ── Main screen ───────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoBadge}>
        <Text style={styles.infoBadgeText}>👤 {employeeId}</Text>
        {station ? <Text style={styles.infoBadgeStation}>{station}</Text> : null}
      </View>

      <Text style={styles.title}>Photograph Gear Label</Text>
      <Text style={styles.subtitle}>
        Take a clear, well-lit photo of the manufacturer's label sewn inside the gear.
        Claude will extract the details automatically.
      </Text>

      {photoUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
          <TouchableOpacity style={styles.retakeBtn} onPress={() => { setPhotoUri(null); setPhotoBase64(null); }}>
            <Text style={styles.retakeBtnText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoPlaceholder} onPress={openCamera}>
          <Text style={styles.photoIcon}>📷</Text>
          <Text style={styles.photoPlaceholderText}>Tap to open camera</Text>
        </TouchableOpacity>
      )}

      {photoUri && (
        <TouchableOpacity
          style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
          onPress={analyzePhoto}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.analyzeBtnText}>Reading label with AI…</Text>
            </>
          ) : (
            <Text style={styles.analyzeBtnText}>Analyze Label with Claude →</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.manualBtn} onPress={skipToManual}>
        <Text style={styles.manualBtnText}>Skip — Enter Manually</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 20, backgroundColor: '#fff', flexGrow: 1 },
  infoBadge: {
    backgroundColor: '#fff3f3', borderWidth: 1, borderColor: '#f8c8c8',
    borderRadius: 10, padding: 12, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  infoBadgeText: { fontSize: 15, fontWeight: '700', color: FIRE_RED },
  infoBadgeStation: { fontSize: 14, color: '#666' },
  title: { fontSize: 22, fontWeight: '700', color: DARK_GRAY, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 24 },
  photoPlaceholder: {
    height: 220, backgroundColor: '#f8f8f8', borderWidth: 2, borderColor: '#ddd',
    borderStyle: 'dashed', borderRadius: 14, justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  photoIcon: { fontSize: 52, marginBottom: 10 },
  photoPlaceholderText: { fontSize: 16, color: '#999' },
  previewWrap: { marginBottom: 20 },
  preview: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#000' },
  retakeBtn: { marginTop: 10, alignSelf: 'center' },
  retakeBtnText: { color: FIRE_RED, fontSize: 15, fontWeight: '600' },
  analyzeBtn: {
    backgroundColor: FIRE_RED, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    marginBottom: 14, elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  analyzeBtnDisabled: { backgroundColor: '#999', elevation: 0 },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  manualBtn: { paddingVertical: 14, alignItems: 'center' },
  manualBtnText: { color: '#888', fontSize: 15 },
  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  labelFrame: {
    width: 300, height: 200, borderWidth: 2.5, borderColor: '#fff',
    borderRadius: 10, backgroundColor: 'transparent',
  },
  cameraHint: {
    color: '#fff', marginTop: 16, fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  captureRow: {
    position: 'absolute', bottom: 48, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 24,
  },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 3, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  cancelBtn: { width: 70, alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
