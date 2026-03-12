import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector, updateProfile } from '../../store';
import { COLORS, SIZES } from '../../constants';
import { CustomButton } from '../../components';

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      await dispatch(updateProfile({ name: name.trim(), phone: phone.trim() || null })).unwrap();
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputContainer, styles.disabledInput]}>
          <Ionicons name="mail-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.input}
            value={user?.email || ''}
            editable={false}
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
        <Text style={styles.hint}>Email cannot be changed</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Your phone number"
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <CustomButton
        title="Save Changes"
        onPress={handleSave}
        loading={loading}
        fullWidth
        size="lg"
        style={{ marginTop: SIZES.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.lg,
  },
  field: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    gap: 10,
    backgroundColor: COLORS.surface,
  },
  disabledInput: {
    backgroundColor: COLORS.borderLight,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontLg,
    color: COLORS.text,
  },
  hint: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});
