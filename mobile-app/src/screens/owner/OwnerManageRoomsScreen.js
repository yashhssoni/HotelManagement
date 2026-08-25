import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ownerApi } from '../../api/ownerApi';

export default function OwnerManageRoomsScreen() {
  const [form, setForm] = useState({
    roomNumber: '',
    roomType: 'Deluxe',
    pricePerNight: '',
    maxGuests: '2',
    amenities: 'AC, Free WiFi, King Bed, Television',
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const roomTypes = ['Single', 'Double', 'Deluxe', 'Suite'];

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to upload room photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleAddRoom = async () => {
    const { roomNumber, roomType, pricePerNight, maxGuests, amenities } = form;

    if (!roomNumber.trim() || !pricePerNight.trim()) {
      Alert.alert('Validation Error', 'Room number and price are required.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('roomNumber', roomNumber.trim());
      formData.append('roomType', roomType);
      formData.append('pricePerNight', pricePerNight.trim());
      formData.append('maxGuests', maxGuests.trim());

      const amenitiesArray = amenities.split(',').map((item) => item.trim());
      formData.append('amenities', JSON.stringify(amenitiesArray));

      images.forEach((image, index) => {
        const fileType = image.uri.split('.').pop();
        formData.append('images', {
          uri: image.uri,
          name: `room_${roomNumber}_${index}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      });

      await ownerApi.addRoom(formData);
      Alert.alert('Success', `Room ${roomNumber} added to hotel inventory.`);
      setForm({
        roomNumber: '',
        roomType: 'Deluxe',
        pricePerNight: '',
        maxGuests: '2',
        amenities: 'AC, Free WiFi, King Bed, Television',
      });
      setImages([]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to upload and create room.';
      Alert.alert('Upload Error', msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView className="flex-1 px-5 py-6">
        <Text className="text-2xl font-black text-slate-900 mb-1">Add New Room</Text>
        <Text className="text-xs text-slate-500 mb-6">
          Upload photos to Cloudinary and define room parameters
        </Text>

        <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-10">
          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Room Number</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="e.g. 101, 204B"
              placeholderTextColor="#94a3b8"
              value={form.roomNumber}
              onChangeText={(val) => setForm({ ...form, roomNumber: val })}
            />
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1.5">Room Category</Text>
            <View className="flex-row gap-2">
              {roomTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setForm({ ...form, roomType: type })}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${
                    form.roomType === type
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      form.roomType === type ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Price / Night (₹)</Text>
              <TextInput
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
                placeholder="2500"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={form.pricePerNight}
                onChangeText={(val) => setForm({ ...form, pricePerNight: val })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Max Capacity</Text>
              <TextInput
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
                placeholder="2"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={form.maxGuests}
                onChangeText={(val) => setForm({ ...form, maxGuests: val })}
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Amenities (Comma separated)</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              value={form.amenities}
              onChangeText={(val) => setForm({ ...form, amenities: val })}
            />
          </View>

          {/* Cloudinary Image Picker */}
          <View className="pt-2">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-2">Room Photos (Cloudinary)</Text>
            <TouchableOpacity
              onPress={pickImages}
              className="w-full border-2 border-dashed border-purple-300 rounded-xl py-4 items-center justify-center bg-purple-50/50"
            >
              <Text className="text-xs font-bold text-purple-700">
                + Select Images ({images.length} Selected)
              </Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal className="flex-row gap-2 mt-3">
                {images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img.uri }}
                    className="w-20 h-20 rounded-xl border border-slate-200"
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity
            className="w-full bg-purple-600 py-3.5 rounded-xl items-center justify-center shadow mt-4"
            onPress={handleAddRoom}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Upload & Add Room</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}