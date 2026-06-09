import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import { saveGearScan } from '../services/firestoreService';

const FIRE_RED = '#B22222';
const DARK_GRAY = '#333';

const FIELDS = [
  { key: 'manufacturer',    label: 'Manufacturer',            multiline: false },
  { key: 'model',           label: 'Model / Style #',         multiline: false },
  { key: 'gearType',        label: 'Gear Type',               multiline: false },
  { key: 'size',            label: 'Size',                    multiline: false },
  { key: 'nfpaStandard',    label: 'NFPA Standard',           multiline: false },
  { key: 'complianceInfo',  label: 'Compliance Info',         multiline: true  },
  { key: 'manufactureDate', label: 'Manufacture Date',        multiline: false },
  { key: 'expirationDate',  label: 'Service Life Expiration', multiline: false },
  { key: 'serialNumber',    label: 'Serial / Lot #',          multiline: false },
  { key: 'inspectionInfo',  label: 'Inspection / ISP Info',   multiline: true  },
];

export default function ReviewScreen({ route, navigation }) {
  const { employeeId, station, gearData, photoUri } = route.params;
  const [fields, setFields] = useState({ ...gearData });
  const [saving, setSaving] = useState(false);

  const updateField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!fields.manufacturer && !fields.serialNumber) {
      Alert.alert('Incomplete Record', 'Fill in at least Manufacturer or Serial Number before saving.');
      return;
    }
    setSaving(true);
    try {
      const docId = await saveGearScan({ employeeId, station: station || '', ...fields });
      Alert.alert('Saved!', `Record saved.\nID: ${docId}`, [
        { text: 'Scan Another', onPress: () => navigation.navigate('GearScan', { employeeId, station }) },
        { text: 'New Firefighter', onPress: () => navigation.navigate('EmployeeID') },
      ]);
    } catch (err) {
      Alert.alert('Save Failed', err.message + '\n\nCheck your Firebase config in src/config/constants.js');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Employee ID</Text>
        <Text style={styles.headerValue}>{employeeId}</Text>
        {station ? (
          <>
            <Text style={styles.headerLabel}>Station</Text>
            <Text style={styles.headerValue}>{station}</Text>
          </>
        ) : null}
      </View>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.thumbnail} resizeMode="cover" />
      )}

      <Text style={styles.sectionTitle}>Extracted Gear Data</Text>
      <Text style={styles.sectionSubtitle}>
        Review and correct any fields before saving.
      </Text>

      {FIELDS.map(({ key, label, multiline }) => (
        <View key={key} style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={[styles.fieldInput, multiline && styles.fieldInputMulti, fields[key] && styles.fieldInputPopulated]}
            value={fields[key]}
            onChangeText={(val) => updateField(key, val)}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            placeholder={`Enter ${label.toLowerCase()}…`}
            placeholderTextColor="#bbb"
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <><ActivityIndicator color="#fff" style={{ marginRight: 10 }} /><Text style={styles.saveBtnText}>Saving…</Text></>
        ) : (
          <Text style={styles.saveBtnText}>Save to Database</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.rescanBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.rescanBtnText}>Rescan Label</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', paddingBottom: 48 },
  header: {
    backgroundColor: '#fff3f3', borderRadius: 10, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#f8c8c8',
  },
  headerLabel: { fontSize: 11, fontWeight: '700', color: FIRE_RED, textTransform: 'uppercase', letterSpacing: 0.8 },
  headerValue: { fontSize: 16, fontWeight: '600', color: DARK_GRAY, marginBottom: 6 },
  thumbnail: { width: '100%', height: 160, borderRadius: 10, marginBottom: 20, backgroundColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: DARK_GRAY, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 18 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    color: DARK_GRAY, backgroundColor: '#f5f5f5',
  },
  fieldInputMulti: { minHeight: 72, textAlignVertical: 'top' },
  fieldInputPopulated: { borderColor: '#f0a0a0', backgroundColor: '#fffafa' },
  saveBtn: {
    backgroundColor: FIRE_RED, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 24,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3,
  },
  saveBtnDisabled: { backgroundColor: '#999', elevation: 0 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  rescanBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  rescanBtnText: { color: '#888', fontSize: 15 },
});
