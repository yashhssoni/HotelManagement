import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function CustomButton({
  title,
  onPress,
  loading = false,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'success'
  disabled = false,
  className = '',
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-200 active:bg-slate-300';
      case 'danger':
        return 'bg-rose-600 active:bg-rose-700';
      case 'success':
        return 'bg-emerald-600 active:bg-emerald-700';
      case 'owner':
        return 'bg-purple-600 active:bg-purple-700';
      case 'primary':
      default:
        return 'bg-blue-600 active:bg-blue-700';
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return 'text-slate-800';
    return 'text-white';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full py-3.5 px-4 rounded-xl items-center justify-center shadow-sm flex-row ${getVariantStyles()} ${
        disabled || loading ? 'opacity-60' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#1e293b' : '#ffffff'} />
      ) : (
        <Text className={`font-bold text-base ${getTextColor()}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}