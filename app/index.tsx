import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import useAuth from '@/hook/useAuth';
import NetInfo from '@react-native-community/netinfo';

const App = () => {
    const redirectPath = useAuth();
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    if (isConnected === false) {
        return <Redirect href="/no-internet" />;
    }
    if (redirectPath) {
        return <Redirect href={redirectPath as any} />;
    }

    return null;
};

export default App;