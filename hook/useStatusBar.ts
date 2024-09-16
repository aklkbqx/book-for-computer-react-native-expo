import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { StatusBar, StatusBarStyle } from "react-native";

export const useStatusBar = (style: StatusBarStyle, animated = true) => {
    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle(style, animated);
        }, [])
    );
};