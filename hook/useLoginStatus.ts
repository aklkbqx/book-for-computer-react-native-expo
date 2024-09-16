import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLoginStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState<boolean>(true);

  const checkLoginStatus = useCallback(async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        setIsLoggedIn(Boolean(userToken));
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบเข้าสู่ระบบ:', error);
      setIsLoggedIn(false);
    } finally {
      setTimeout(() => setIsCheckingLogin(false), 100);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return { isLoggedIn, isCheckingLogin, checkLoginStatus };
};

export default useLoginStatus;
