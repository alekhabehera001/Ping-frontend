import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../constants/config';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function PingInput({ label, error, isPassword, style, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          placeholderTextColor={COLORS.muted}
          secureTextEntry={isPassword && !visible}
          style={[styles.input, style]}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.eye}>
            <Text style={styles.eyeText}>{visible ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 14,
  },
  eye: { padding: 4 },
  eyeText: { fontSize: 18 },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
