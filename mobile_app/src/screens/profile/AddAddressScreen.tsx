import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { orderService } from '../../services/orderService';
import { Address } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { CustomButton } from '../../components';

type AddressType = 'HOME' | 'OFFICE' | 'OTHER';

export default function AddAddressScreen({ route, navigation }: any) {
  const existingAddress: Address | undefined = route.params?.address;
  const isEdit = !!existingAddress;

  const [fullName, setFullName] = useState(existingAddress?.fullName || '');
  const [phone, setPhone] = useState(existingAddress?.phone || '');
  const [addressLine1, setAddressLine1] = useState(existingAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(existingAddress?.addressLine2 || '');
  const [city, setCity] = useState(existingAddress?.city || '');
  const [state, setState] = useState(existingAddress?.state || '');
  const [pincode, setPincode] = useState(existingAddress?.pincode || '');
  const [type, setType] = useState<AddressType>(existingAddress?.type || 'HOME');
  const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: 'India',
      type,
      isDefault,
    };
    try {
      if (isEdit) {
        await orderService.updateAddress(existingAddress!.id, payload);
      } else {
        await orderService.createAddress(payload as any);
      }
      Alert.alert('Success', `Address ${isEdit ? 'updated' : 'added'} successfully`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field label="Full Name *" value={fullName} onChangeText={setFullName} placeholder="Recipient name" />
      <Field label="Phone *" value={phone} onChangeText={setPhone} placeholder="10-digit phone" keyboardType="phone-pad" />
      <Field label="Address Line 1 *" value={addressLine1} onChangeText={setAddressLine1} placeholder="House/Flat no., Street" />
      <Field label="Address Line 2" value={addressLine2} onChangeText={setAddressLine2} placeholder="Landmark, Area (optional)" />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Field label="City *" value={city} onChangeText={setCity} placeholder="City" />
        </View>
        <View style={styles.halfField}>
          <Field label="State *" value={state} onChangeText={setState} placeholder="State" />
        </View>
      </View>

      <Field label="Pincode *" value={pincode} onChangeText={setPincode} placeholder="6-digit pincode" keyboardType="number-pad" maxLength={6} />

      <Text style={styles.label}>Address Type</Text>
      <View style={styles.typeRow}>
        {(['HOME', 'OFFICE', 'OTHER'] as AddressType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, type === t && styles.typeChipActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.defaultToggle} onPress={() => setIsDefault(!isDefault)}>
        <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
          {isDefault && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.defaultLabel}>Set as default address</Text>
      </TouchableOpacity>

      <CustomButton
        title={isEdit ? 'Update Address' : 'Save Address'}
        onPress={handleSave}
        loading={loading}
        fullWidth
        size="lg"
        style={{ marginTop: SIZES.lg }}
      />
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, maxLength }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.lg, paddingBottom: SIZES.xxl },
  field: { marginBottom: SIZES.md },
  label: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: SIZES.fontLg,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  row: { flexDirection: 'row', gap: SIZES.md },
  halfField: { flex: 1 },
  typeRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.lg },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: { borderColor: COLORS.primary, backgroundColor: '#FFF8F0' },
  typeChipText: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  typeChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  defaultToggle: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  defaultLabel: { fontSize: SIZES.fontMd, color: COLORS.text },
});
