import { View, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import twclass from '@/constants/twclass'
import TextTheme from '@/components/TextTheme'
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';
import IconIonicons from '@/components/IconIonicons';
import api, { saveToken } from '@/helper/api';
import { AxiosError } from 'axios';
import { BlurView } from 'expo-blur';
import { useStatusBar } from '@/hook/useStatusBar';

type FormData = {
    [key: string]: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const Register = () => {
    useStatusBar(Platform.OS != "ios" ? "dark-content" : "light-content");
    const [formData, setFormData] = useState<FormData>({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
    const [isChecked, setChecked] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const submitFormRegister = async () => {
        setModalVisible(true);
        try {
            const response = await api.post("/api/v1/auth/register", { ...formData });
            setTimeout(async () => {
                if (response.success) {
                    const { token, role } = response;
                    await saveToken(token);
                    if (role === "USER") {
                        router.replace("/");
                    } else if (role === "ADMIN") {
                        router.replace("/");
                    }
                    Alert.alert("สำเร็จ!", "สมัครสมาชิกเสร็จสิ้น", [{ text: "OK" }]);
                }
            }, 1000);
            setModalVisible(false);
        } catch (error) {
            setModalVisible(false);
            if (error instanceof AxiosError) {
                if (error.response) {
                    Alert.alert("เกิดข้อผิดพลาด!", error.response.data.message, [{ text: "OK" }]);
                }
            }
        }
    }

    useEffect(() => {
        setDisableSubmit(!Object.keys(formData).every((key) => formData[key] !== ""));
    }, [formData]);

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={20} style={twclass("flex-1 items-center justify-center")}>
                    <View style={twclass("flex-row items-center gap-2")}>
                        <ActivityIndicator size="large" />
                    </View>
                </BlurView>
            </Modal>

            <TouchableWithoutFeedback onPress={Platform.OS !== "web" ? Keyboard.dismiss : Keyboard.isVisible}>
                <View style={twclass("flex-1 flex-row justify-center items-center relative")}>
                    <TouchableOpacity onPress={() => router.dismissAll()} style={twclass("absolute z-99 ios:top-10 android:top-15 left-5")}>
                        <IconIonicons name='close-circle' style={twclass("text-sky-800")} size={30} />
                    </TouchableOpacity>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? -100 : 0}
                    >
                        <View style={twclass("items-center justify-center")}>
                            <TextTheme font='Prompt-SemiBold' color='sky-800' size='2xl'>สมัครสมาชิก</TextTheme>
                            <View style={twclass("w-70")}>
                                <View style={twclass("flex-col gap-2 mt-5")}>
                                    {Object.entries(formData).map(([field, value], index) => (
                                        <View key={`${field}-${index}`}>
                                            <TextInput
                                                style={[twclass("flex-row border-2 p-3 border-slate-300 rounded-xl"), { fontFamily: "Prompt-Regular" }]}
                                                placeholder={field === "firstname" ? "ชื่อ" : (field === "lastname" ? "นามสกุล" : (field === "email" ? "อีเมล" : (field === "password" ? "รหัสผ่าน" : (field === "confirmPassword" ? "ยืนยันรหัสผ่านอีกครั้ง" : ''))))}
                                                placeholderTextColor={"#9E9E9E"}
                                                value={formData[field]}
                                                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                                                autoCapitalize="none"
                                                textContentType={'oneTimeCode'}
                                                keyboardType={field === 'email' ? 'email-address' : 'default'}
                                                secureTextEntry={(field === "password" || field === "confirmPassword") ? true : false}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <View style={twclass("flex-row items-center justify-between mt-5")}>
                                    <TouchableOpacity onPress={() => setChecked(!isChecked)} style={twclass("flex-row gap-2 items-center")}>
                                        <Checkbox value={isChecked} onValueChange={setChecked} style={twclass("rounded-1.5")} />
                                        <TextTheme color='zinc-400'>จดจำฉัน</TextTheme>
                                    </TouchableOpacity>
                                </View>

                                <View style={twclass("mt-5")}>
                                    <TouchableOpacity disabled={disableSubmit} onPress={submitFormRegister} style={twclass(`bg-sky-800 p-2 rounded-xl flex-row justify-center items-center ${disableSubmit ? 'opacity-70' : 'opacity-100'}`)}>
                                        <TextTheme font='Prompt-SemiBold' color='white' size='2xl'>
                                            {!modalVisible ? "สมัครสมาชิก" : "กำลังโหลด..."}
                                        </TextTheme>
                                    </TouchableOpacity>
                                </View>

                                <View style={twclass("flex-col items-center mt-5")}>
                                    <TextTheme color='zinc-400' font='Prompt-Regular'>ฉันมีบัญชีอยู่แล้ว</TextTheme>
                                    <TouchableOpacity onPress={() => router.navigate("/login")}>
                                        <TextTheme color='zinc-400' font='Prompt-SemiBold' style={twclass("underline")}>เข้าสู่ระบบ</TextTheme>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </>
    )
}

export default Register;
