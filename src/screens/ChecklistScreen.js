import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const FIRE_RED = '#B22222';

const CHECKLIST_ITEMS = [
  { id: '1', name: 'Helmet', description: 'Check for cracks, dents, shell damage' },
  { id: '2', name: 'Coat / Jacket', description: 'Check outer shell, liner, reflective trim' },
  { id: '3', name: 'Pants / Trousers', description: 'Check outer shell, liner, reflective trim' },
  { id: '4', name: 'Boots', description: 'Check soles, uppers, steel toe integrity' },
  { id: '5', name: 'Gloves', description: 'Check for holes, tears, wrist closure' },
  { id: '6', name: 'Hood / Balaclava', description: 'Check for holes, burns, elastic integrity' },
  { id: '7', name: 'SCBA', description: 'Check straps, buckles, cylinder pressure' },
  { id: '8', name: 'Suspenders', description: 'Check clips, straps, adjusters' },
  { id: '9', name: 'Eye Protection', description: 'Check lenses for scratches or cracks' },
];

export default function ChecklistScreen({ navigation }) {
  const [checked, setChecked] = useState({});
  const [saved, setSaved] = useState(false);

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const allChecked = CHECKLIST_ITEMS.every(item => checked[item.id]);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const handleSave = () => {
    if (!allChecked) {
      Alert.alert('Incomplete', 'Please check off all items before saving.');
      return;
    }
    setSaved(true);
    Alert.alert('✅ Checklist Complete', `NFPA 1850 inspection saved at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NFPA 1850 Checklist</Text>
        <Text style={styles.headerSub}>Gear Inventory & Compliance</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{checkedCount} of {CHECKLIST_ITEMS.length} items inspected</Text>
      </View>

      <View style={styles.list}>
        {CHECKLIST_ITEMS.map(item => (
          <TouchableOpacity key={item.id} style={styles.item} onPress={() => toggle(item.id)}>
            <View style={[styles.checkbox, checked[item.id] && styles.checkboxChecked]}>
              {checked[item.id] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.itemText}>
              <Text style={[styles.itemName, checked[item.id] && styles.itemNameChecked]}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, !allChecked && styles.saveBtnDisabled]}
        onPress={handleSave}
      >
        <Text style={styles.saveBtnText}>{saved ? '✅ Saved' : 'Save Inspection'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  header: { backgroundColor: FIRE_RED, padding: 20, paddingTop: 30 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2, marginBottom: 16 },
  progressBar: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, height: 8, marginBottom: 6 },
  progressFill: { backgroundColor: '#fff', borderRadius: 10, height: 8 },
  progressText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  list: { padding: 16 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  checkbox: { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E0', marginRight: 14, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#38A169', borderColor: '#38A169' },
  checkmark: { color: '#fff', fontSize: 15, fontWeight: '800' },
  itemText: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#0A1628' },
  itemNameChecked: { color: '#38A169' },
  itemDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  saveBtn: { backgroundColor: FIRE_RED, margin: 16, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#ccc' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
