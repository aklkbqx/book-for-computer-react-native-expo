import { View, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import twclass from '@/constants/twclass'
import TextTheme from '@/components/TextTheme'
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';
import IconIonicons from '@/components/IconIonicons';
import api, { saveToken } from '@/helper/api';
import { BlurView } from 'expo-blur';
import { useStatusBar } from '@/hook/useStatusBar';

type FormData = {
    [key: string]: string;
    email: string;
    password: string;
};

const Login = () => {
    useStatusBar(Platform.OS != "ios" ? "dark-content" : "light-content");
    const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
    const [isChecked, setChecked] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

    const submitFormLogin = async () => {
        setModalVisible(true);
        try {
            const response = await api.post("/api/v1/auth/login", { ...formData });
            setTimeout(async () => {
                if (response.success) {
                    const { token, role } = response;
                    await saveToken(token);
                    if (role === "USER") {
                        router.replace("/");
                    } else if (role === "ADMIN") {
                        router.replace("/admin");
                    }
                    Alert.alert("สำเร็จ!", "เข้าสู่ระบบสำเร็จ", [{ text: "OK" }]);
                }
            }, 1000);
        } catch (error) {
            Alert.alert("เกิดข้อผิดพลาด!", "มีข้อผิดพลาดบางอย่างเกิดขึ้น กรุณาติดต่อเจ้าหน้าที่!", [{ text: "OK" }]);
        } finally {
            setTimeout(() => setModalVisible(false), 1000);
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
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
                        <View style={twclass("flex-col items-center")}>
                            <TextTheme font='Prompt-SemiBold' color='sky-800' size='2xl'>เข้าสู่ระบบ</TextTheme>
                            <View style={twclass("w-70")}>
                                <View style={twclass("flex-col gap-2 mt-5")}>
                                    {Object.entries(formData).map(([field, value], index) => {
                                        return (
                                            <TextInput key={`${field}-${index}`}
                                                style={[twclass("flex-row border-2 p-3 border-slate-300 rounded-xl text-zinc-500"), { fontFamily: "Prompt-Regular" }]}
                                                placeholder={field == "email" ? "อีเมล" : "รหัสผ่าน"}
                                                placeholderTextColor={"#9E9E9E"}
                                                value={formData[field]}
                                                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                                                autoCapitalize="none"
                                                textContentType={'oneTimeCode'}
                                                keyboardType={field === 'email' ? 'email-address' : 'default'}
                                                secureTextEntry={field === "password" ? true : false}
                                            />
                                        )
                                    })}
                                </View>
                                <View style={twclass("flex-row items-center justify-between mt-5")}>
                                    <TouchableOpacity onPress={() => setChecked(!isChecked)} style={twclass("flex-row gap-2 items-center")}>
                                        <Checkbox value={isChecked} onValueChange={setChecked} style={twclass("rounded-1.5")} />
                                        <TextTheme color='zinc-400'>จดจำฉัน</TextTheme>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <TextTheme color='zinc-400' font='Prompt-SemiBold' style={twclass("underline")}>ลืมรหัสผ่าน?</TextTheme>
                                    </TouchableOpacity>
                                </View>

                                <View style={twclass("mt-5")}>
                                    <TouchableOpacity disabled={disableSubmit} onPress={submitFormLogin} style={twclass(`bg-sky-800 p-2 rounded-xl flex-row justify-center items-center ${disableSubmit ? 'opacity-70' : 'opacity-100'}`)}>
                                        <TextTheme font='Prompt-SemiBold' color='white' size='2xl'>
                                            {!modalVisible ? "เข้าสู่ระบบ" : "กำลังโหลด..."}
                                        </TextTheme>
                                    </TouchableOpacity>
                                </View>

                                <View style={twclass("flex-col items-center mt-5")}>
                                    <TextTheme color='zinc-400' font='Prompt-Regular'>ฉันยังไม่มีบัญชี</TextTheme>
                                    <TouchableOpacity onPress={() => router.navigate("/register")}>
                                        <TextTheme color='zinc-400' font='Prompt-SemiBold' style={twclass("underline")}>สมัครสมาชิก</TextTheme>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View >
            </TouchableWithoutFeedback>
        </>
    )
}

export default Login