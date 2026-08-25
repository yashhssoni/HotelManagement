import React from 'react';
import { View, Text } from 'react-native';

export default function StatusBadge({ status, className = '' }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-800' };
      case 'checked_in':
        return { label: 'Checked In', bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'checked_out':
        return { label: 'Checked Out', bg: 'bg-slate-100', text: 'text-slate-800' };
      case 'pending_allotment':
        return { label: 'Pending Allotment', bg: 'bg-amber-100', text: 'text-amber-800' };
      case 'available':
        return { label: 'Available', bg: 'bg-teal-100', text: 'text-teal-800' };
      case 'occupied':
        return { label: 'Occupied', bg: 'bg-rose-100', text: 'text-rose-800' };
      case 'cleaning':
        return { label: 'Cleaning', bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'maintenance':
        return { label: 'Maintenance', bg: 'bg-orange-100', text: 'text-orange-800' };
      default:
        return { label: status || 'Unknown', bg: 'bg-slate-100', text: 'text-slate-700' };
    }
  };

  const { label, bg, text } = getBadgeConfig();

  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${bg} ${className}`}>
      <Text className={`text-[11px] font-bold tracking-wide uppercase ${text}`}>
        {label}
      </Text>
    </View>
  );
}