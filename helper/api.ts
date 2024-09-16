import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";

// export const current_port = "5001";
// export const current_ip = "172.20.10.2";
// export const current_ip = "13.55.110.53";
// export const apiUrl = `http://${current_ip}:${current_port}`;
export const apiUrl = `https://book-for-computer-backend.onrender.com`;

async function request(url: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem("userToken");
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${apiUrl}${url}`, config);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

const api = {
    get: (url: string) => request(url, { method: 'GET' }),
    post: (url: string, data: any) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url: string, data: any) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url: string) => request(url, { method: 'DELETE' }),
    postFormData: (url: string, data: FormData) => request(url, { method: 'POST', body: data })
};


export default api;

export const saveToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('userToken', token);
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

export interface UserData {
    firstname: string;
    lastname: string;
    email: string;
    profile: string | null;
    role: string;
}

export const fetchUserData = (setUserData: React.Dispatch<React.SetStateAction<UserData | null>>) => {
    return new Promise((resolve, reject) => {
        api.get('/api/v1/users/me')
            .then(data => {
                setUserData(data);
                resolve(data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                Alert.alert(
                    "เกิดข้อผิดพลาด!",
                    "ไม่สามารถดึงข้อมูลผู้ใช้ได้\nโปรดทำการตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ",
                    [{ text: "OK" }]
                );
                reject(error);
            });
    });
};