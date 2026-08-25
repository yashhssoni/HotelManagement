import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { receptionistApi } from '../../api/receptionistApi';
import { AuthContext } from '../../context/AuthContext';

export default function ReceptionistPendingScreen() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [allotting, setAllotting] = useState(false);

  const { logout } = useContext(AuthContext);

  const fetchPending = async () => {
    try {
      const response = await receptionistApi.getPendingBookings();
      setPendingBookings(response.data);
    } catch (error) {
      console.error('Fetch Pending Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAllotRoom = async () => {
    if (!roomIdInput.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid Room ID / Room Number reference.');
      return;
    }

    setAllotting(true);
    try {
      await receptionistApi.allotRoom(selectedBooking._id, roomIdInput.trim());
      Alert.alert(
        'Success',
        'Room successfully allotted and confirmation email dispatched to the guest!'
      );
      setSelectedBooking(null);
      setRoomIdInput('');
      fetchPending();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to allot room.';
      Alert.alert('Allotment Error', msg);
    } finally {
      setAllotting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-200">
        <View>
          <Text className="text-xl font-bold text-slate-900">Front Desk Desk</Text>
          <Text className="text-xs text-slate-500">Pending Room Allotments</Text>
        </View>
        <TouchableOpacity
          onPress={logout}
          className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-xs font-bold text-red-600">Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={pendingBookings}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchPending();
              }}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-slate-400 font-medium">No pending room allotments 🎉</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-xs font-mono font-bold text-slate-400 uppercase">
                    #{item.bookingId}
                  </Text>
                  <Text className="text-base font-bold text-slate-800 mt-0.5">
                    {item.customerId?.name || 'Guest User'}
                  </Text>
                  <Text className="text-xs text-slate-500">{item.customerId?.email}</Text>
                  <Text className="text-xs text-slate-500">{item.customerId?.phone}</Text>
                </View>
                <View className="bg-amber-100 px-2.5 py-1 rounded-full">
                  <Text className="text-[11px] font-bold text-amber-800">Needs Allotment</Text>
                </View>
              </View>

              <View className="bg-slate-50 p-3 rounded-xl border border-slate-100 my-2">
                <Text className="text-xs text-slate-500">Requested Room Type</Text>
                <Text className="text-sm font-extrabold text-slate-800">{item.roomType}</Text>
              </View>

              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100">
                <Text className="text-base font-bold text-emerald-700">₹{item.totalAmount} (Paid)</Text>
                <TouchableOpacity
                  className="bg-emerald-600 px-4 py-2 rounded-xl shadow"
                  onPress={() => setSelectedBooking(item)}
                >
                  <Text className="text-white font-bold text-xs">Allot Room & Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Room Allotment Modal */}
      <Modal visible={!!selectedBooking} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-6 rounded-t-3xl border-t border-slate-200">
            <Text className="text-lg font-bold text-slate-900 mb-1">
              Allot Room for #{selectedBooking?.bookingId}
            </Text>
            <Text className="text-xs text-slate-500 mb-4">
              Guest: {selectedBooking?.customerId?.name} ({selectedBooking?.roomType})
            </Text>

            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">
              Select/Enter Database Room ID
            </Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 mb-4"
              placeholder="Paste 24-char Room ObjectId"
              placeholderTextColor="#94a3b8"
              value={roomIdInput}
              onChangeText={setRoomIdInput}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-slate-200 py-3 rounded-xl items-center justify-center mr-2"
                onPress={() => setSelectedBooking(null)}
                disabled={allotting}
              >
                <Text className="font-bold text-slate-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-emerald-600 py-3 rounded-xl items-center justify-center ml-2 shadow"
                onPress={handleAllotRoom}
                disabled={allotting}
              >
                {allotting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="font-bold text-white">Confirm Allotment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}