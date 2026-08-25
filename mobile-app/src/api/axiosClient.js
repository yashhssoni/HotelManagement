import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace 192.168.1.X with your computer's local Wi-Fi IP address for Expo Go physical device testing
const BASE_URL = 'https://hotelmanagement-skx0.onrender.com/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatically inject JWT Bearer Token into headers
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;