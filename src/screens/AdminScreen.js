import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, FlatList, Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { getAllGearScans } from '../services/firestoreService';

const FIRE_RED = '#B22222';
const DARK_GRAY = '#333';

const EXPORT_COLUMNS = [
  'id', 'employeeId', 'station', 'timestamp',
  'manufacturer', 'model', 'gearType', 'size',
  'nfpaStandard', 'complianceInfo', 'manufactureDate',
  'expirationDate', 'serialNumber', 'inspectionInfo',
];

const COLUMN_HEADERS = {
  id: 'Record ID', employeeId: 'Employee ID', station: 'Station',
  timestamp: 'Timestamp', manufacturer: 'Manufacturer', model: 'Model/Style #',
  gearType: 'Gear Type', size: 'Size', nfpaStandard: 'NFPA Standard',
  complianceInfo: 'Compliance Info', manufactureDate: 'Manufacture Date',
  expirationDate: 'Expiration Date', serialNumber: 'Serial / Lot #',
  inspectionInfo: 'Inspection / ISP Info',
};

export default function AdminScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      setRecords(await getAllGearScans());
    } catch (err) {
      Alert.alert('Load Error', err.message + '\n\nCheck your Firebase config.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (records.length === 0) {
      Alert.alert('No Records', 'No scan records to export yet.');
      return;
    }
    setExporting(true);
    try {
      const rows = records.map((rec) => {
        const row = {};
        EXPORT_COLUMNS.forEach((col) => { row[COLUMN_HEADERS[col]] = rec[col] ?? ''; });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Gear Scans');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const filename = `gear_scans_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Gear Scan Records',
          UTI: 'com.microsoft.excel.xlsx',
        });
      } else {
        Alert.alert('Export Complete', `File saved to:\n${uri}`);
      }
    } catch (err) {
      Alert.alert('Export Failed', err.message);
    } finally {
      setExporting(false);
    }
  };

  const renderRecord = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardId}>👤 {item.employeeId}</Text>
        {item.station ? <Text style={styles.cardStation}>{item.station}</Text> : null}
      </View>
      <Text style={styles.cardGear}>
        {[item.manufacturer, item.model, item.gearType, item.size].filter(Boolean).join(' · ') || 'No gear data'}
      </Text>
      {item.serialNumber ? <Text style={styles.cardSerial}>S/N: {item.serialNumber}</Text> : null}
      <Text style={styles.cardDate}>
        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{records.length}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{new Set(records.map((r) => r.employeeId)).size}</Text>
          <Text style={styles.statLabel}>Firefighters</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{new Set(records.map((r) => r.station).filter(Boolean)).size}</Text>
          <Text style={styles.statLabel}>Stations</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.exportBtn, (exporting || loading) && styles.exportBtnDisabled]}
        onPress={exportToExcel}
        disabled={exporting || loading}
      >
        {exporting ? (
          <><ActivityIndicator color="#fff" style={{ marginRight: 10 }} /><Text style={styles.exportBtnText}>Generating Excel…</Text></>
        ) : (
          <Text style={styles.exportBtnText}>📊  Export All Records to Excel (.xlsx)</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshBtn} onPress={loadRecords} disabled={loading}>
        <Text style={styles.refreshBtnText}>{loading ? 'Loading…' : '↻  Refresh'}</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={FIRE_RED} style={{ marginTop: 40 }} />
      ) : records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No records yet.</Text>
          <Text style={styles.emptySubtext}>Scans saved by firefighters will appear here in real time.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecord}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  statsBar: { flexDirection: 'row', backgroundColor: FIRE_RED, paddingVertical: 16, paddingHorizontal: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 26, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },
  exportBtn: {
    backgroundColor: '#1a6b35', margin: 16, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  exportBtnDisabled: { backgroundColor: '#999', elevation: 0 },
  exportBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  refreshBtn: { alignSelf: 'center', marginBottom: 12 },
  refreshBtnText: { color: FIRE_RED, fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee',
    borderRadius: 10, padding: 14, marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardId: { fontSize: 15, fontWeight: '700', color: FIRE_RED },
  cardStation: {
    fontSize: 13, color: '#666', backgroundColor: '#f0f0f0',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  cardGear: { fontSize: 14, color: DARK_GRAY, marginBottom: 4 },
  cardSerial: { fontSize: 12, color: '#888', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 4 },
  cardDate: { fontSize: 11, color: '#aaa' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: DARK_GRAY, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
});
