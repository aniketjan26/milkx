import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { getFarmersByCollector, addFarmer } from '@/services/service';
import { useAuthStore } from '@/store/authStore';
// import { getFarmersByCollector, addFarmer } from '../../src/db/service';
// import { useAuthStore } from '../../src/store/authStore';

interface Farmer {
  id: string; farmerId: string; name: string; phone: string;
  address: string | null; active: boolean | null;
}

export default function FarmersScreen() {
  const { user } = useAuthStore();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // Add farmer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const collectorId = user?.collectorId ?? '';

  async function loadFarmers() {
    if (!collectorId) return;
    try {
      const data = await getFarmersByCollector(collectorId);
      setFarmers(data as any);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { loadFarmers(); }, [collectorId]));

  async function handleAddFarmer() {
    if (!newName.trim()) { Alert.alert('Required', 'Enter farmer name'); return; }
    if (newPhone.length !== 10) { Alert.alert('Invalid', 'Enter valid 10-digit mobile number'); return; }
    setSaving(true);
    try {
      await addFarmer({ name: newName, phone: newPhone, address: newAddress, collectorId });
      await loadFarmers();
      setShowAdd(false);
      setNewName(''); setNewPhone(''); setNewAddress('');
      Alert.alert('Success', 'Farmer added successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to add farmer');
    } finally {
      setSaving(false);
    }
  }

  const filtered = farmers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.farmerId.toLowerCase().includes(search.toLowerCase()) ||
    f.phone.includes(search)
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Farmer List</Text>
        <Text style={s.count}>{farmers.length} farmers</Text>
      </View>

      <View style={s.searchBar}>
        <Text style={{ fontSize: 16, marginRight: Spacing.sm }}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search by name, ID or phone" placeholderTextColor={Colors.neutral.gray} value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: Colors.neutral.gray, fontSize: 18 }}>✕</Text></TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary.green} />
        </View>
      ) : (
        <FlatList
          data={filtered} keyExtractor={i => i.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 48 }}>🌾</Text>
              <Text style={s.emptyTitle}>{search ? 'No farmers found' : 'No farmers yet'}</Text>
              <Text style={s.emptySub}>{search ? 'Try a different search' : 'Tap "+ Add Farmer" to get started'}</Text>
            </View>
          }
          renderItem={({ item: f }) => (
            <TouchableOpacity style={s.card} activeOpacity={0.7}>
              <View style={s.avatar}><Text style={s.avatarText}>{f.name[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{f.name}</Text>
                <Text style={s.meta}>{f.farmerId} · {f.phone}</Text>
                {f.address ? <Text style={s.address} numberOfLines={1}>{f.address}</Text> : null}
              </View>
              <Text style={{ color: Colors.neutral.midGray, fontSize: 22 }}>›</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      )}

      <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={s.addBtnText}>+ Add Farmer</Text>
      </TouchableOpacity>

      {/* Add Farmer Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={s.modalCancel}>Cancel</Text></TouchableOpacity>
              <Text style={s.modalTitle}>Add New Farmer</Text>
              <TouchableOpacity onPress={handleAddFarmer} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.primary.green} /> : <Text style={s.modalSave}>Save</Text>}
              </TouchableOpacity>
            </View>

            <View style={s.modalForm}>
              <View style={s.field}>
                <Text style={s.label}>Full Name *</Text>
                <TextInput style={s.input} value={newName} onChangeText={setNewName} placeholder="e.g. Ramesh Kumar" placeholderTextColor={Colors.neutral.midGray} autoCapitalize="words" autoFocus />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Mobile Number *</Text>
                <TextInput style={s.input} value={newPhone} onChangeText={setNewPhone} placeholder="10-digit number" placeholderTextColor={Colors.neutral.midGray} keyboardType="phone-pad" maxLength={10} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Address (optional)</Text>
                <TextInput style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: Spacing.md }]} value={newAddress} onChangeText={setNewAddress} placeholder="Village / Town" placeholderTextColor={Colors.neutral.midGray} multiline />
              </View>
              <View style={s.infoCard}>
                <Text style={s.infoText}>ℹ️ Farmer ID will be auto-generated (e.g. FAR001)</Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.offWhite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary.green, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, paddingBottom: Spacing.xl },
  title: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' },
  count: { fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', fontSize: Typography.size.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: Spacing.xl, marginTop: -Spacing.lg, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.neutral.charcoal },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary.lightGreen, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  avatarText: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.primary.green },
  name: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.base, color: Colors.neutral.charcoal },
  meta: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, marginTop: 1 },
  address: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.midGray, marginTop: 1 },
  empty: { alignItems: 'center', paddingTop: Spacing['4xl'] },
  emptyTitle: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal, marginTop: Spacing.md },
  emptySub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray, marginTop: Spacing.xs },
  addBtn: { position: 'absolute', bottom: 20, left: Spacing.xl, right: Spacing.xl, backgroundColor: Colors.primary.green, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center', ...Shadows.elevated },
  addBtnText: { fontFamily: Typography.fontFamily.semibold, color: '#fff', fontSize: Typography.size.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.neutral.lightGray },
  modalTitle: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal },
  modalCancel: { fontFamily: Typography.fontFamily.medium, color: Colors.neutral.gray, fontSize: Typography.size.md },
  modalSave: { fontFamily: Typography.fontFamily.semibold, color: Colors.primary.green, fontSize: Typography.size.md },
  modalForm: { padding: Spacing.xl },
  field: { marginBottom: Spacing.lg },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.neutral.darkGray, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.neutral.offWhite, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.md, color: Colors.neutral.charcoal, borderWidth: 1, borderColor: Colors.neutral.lightGray },
  infoCard: { backgroundColor: Colors.primary.lightGreen, borderRadius: BorderRadius.md, padding: Spacing.md },
  infoText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.primary.darkGreen },
});
