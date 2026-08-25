import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error = '',
  className = '',
  ...props
}) {
  return (
    <View className={`mb-3.5 ${className}`}>
      {label && (
        <Text className="text-xs font-semibold uppercase text-slate-500 mb-1 tracking-wider">
          {label}
        </Text>
      )}
      <TextInput
        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-800 text-sm ${
          error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'
        }`}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...props}
      />
      {error ? (
        <Text className="text-[11px] text-rose-500 font-medium mt-1">{error}</Text>
      ) : null}
    </View>
  );
}