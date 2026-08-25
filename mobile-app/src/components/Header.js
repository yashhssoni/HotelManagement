import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function Header({ title, subtitle, showLogout = true }) {
  const { logout, user, role } = useContext(AuthContext);

  const getRoleBadge = () => {
    if (role === 'owner') return { label: 'Owner', bg: 'bg-purple-100 text-purple-700' };
    if (role === 'receptionist') return { label: 'Front Desk', bg: 'bg-emerald-100 text-emerald-700' };
    return { label: 'Guest', bg: 'bg-blue-100 text-blue-700' };
  };

  const badge = getRoleBadge();

  return (
    <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-slate-200">
      <View className="flex-1 pr-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-black text-slate-900">{title}</Text>
          <View className={`px-2 py-0.5 rounded-md ${badge.bg.split(' ')[0]}`}>
            <Text className={`text-[10px] font-extrabold ${badge.bg.split(' ')[1]}`}>
              {badge.label}
            </Text>
          </View>
        </View>
        {subtitle && <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>}
      </View>

      {showLogout && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={logout}
          className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl"
        >
          <Text className="text-xs font-bold text-rose-600">Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}