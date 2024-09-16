import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/helper/api';

const useAuth = () => {
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                if (userToken) {
                    const response = await api.get("/api/v1/users/me");
                    if (response.role === "ADMIN") {
                        setRedirectPath("/admin");
                    } else {
                        setRedirectPath("/home");
                    }
                } else {
                    setRedirectPath("/home");
                }
            } catch (error) {
                console.error("Authentication error:", error);
                setRedirectPath("/home");
            }
        };

        checkAuth();
    }, []);

    return redirectPath;
};

export default useAuth;
