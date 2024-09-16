import { ActivityIndicator, Alert, Image, Modal, Platform, RefreshControl, SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useStatusBar } from '@/hook/useStatusBar'
import twclass from '@/constants/twclass';
import TextTheme from '@/components/TextTheme';
import { BlurView } from 'expo-blur';
import Loading from '@/components/Loading';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { apiUrl } from '@/helper/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import IconIonicons from '@/components/IconIonicons';
import * as ImagePicker from 'expo-image-picker';
import { resizeImage } from '@/helper/my-lib';

interface bookType {
  color: string;
  book_image: string;
  th_name: string;
  eng_name: string;
}

const Settings = () => {
  useStatusBar("dark-content");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { book_id, } = useLocalSearchParams();
  const bookId = Number(Array.isArray(book_id) ? book_id[0] : book_id);
  const [book, setBook] = useState<bookType | null>(null);
  const [colorHeader, setColorHeader] = useState(["#fff", "#fff"]);
  const [bookTitleThai, setBookTitleThai] = useState<string>('');
  const [bookTitleEnglish, setBookTitleEnglish] = useState<string>('');
  const [bookImage, setBookImage] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchBook = async () => {
    const response = await fetch(apiUrl + "/api/v1/books/" + book_id)
    if (response.ok) {
      const data = await response.json();
      setBook(data);
    } else {
      console.log('Error:', response.status);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(async () => {
      fetchBook();
      setRefreshing(false);
    }, 1000);
  }
  const pickImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted) {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1
      })

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const resizedImage = await resizeImage(pickerResult.assets[0].uri, 120, 200);
        if (resizedImage) {
          setBookImage(resizedImage.uri)
        }
      }
    }
  }

  useEffect(() => {
    if (book) {
      setBookTitleThai(book.th_name);
      setBookTitleEnglish(book.eng_name);
      setColorHeader([`${twclass(`bg-${book.color}-400`).backgroundColor}`, `${twclass(`bg-${book.color}-700`).backgroundColor}`])
    }
  }, [book]);

  const deleteBook = (bookId: number) => {
    Alert.alert('คำเตือน!', 'คุณแน่ใจที่จะทำการลบหนังสือนี้หรือไม่', [
      {
        text: 'ยกเลิก',
        style: 'cancel',
      },
      {
        text: 'ตกลง', onPress: () => {
          setModalVisible(true);
          setTimeout(async () => {
            const response = await fetch(apiUrl + "/api/v1/books/delete/" + bookId, {
              method: "DELETE"
            })
            if (response.ok) {
              Alert.alert("Success", "ลบหนังสือแล้ว​​!", [{ text: "OK", onPress: () => router.back() }]);
            }
          }, 1000)
        }, style: "destructive"
      },
    ]);
  }

  useFocusEffect(useCallback(() => {
    fetchBook();
  }, []))


  const submitSaveForm = useCallback(async () => {
    setModalVisible(true);
    const formData = new FormData();
    formData.append('th_name', bookTitleThai);
    formData.append('eng_name', bookTitleEnglish);
    formData.append('book_image', bookImage ? { uri: bookImage, type: 'image/jpeg', name: 'book_image.jpeg' } : '' as any);

    const response = await fetch(`${apiUrl}/api/v1/books/update/${bookId}`, {
      method: 'PATCH',
      body: formData,
      headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
    });
  }, [bookTitleThai, bookTitleEnglish, bookImage])

  return (
    <>
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <BlurView intensity={20} style={twclass("flex-1 items-center justify-center")}>
          <Loading />
        </BlurView>
      </Modal>

      <SafeAreaView style={twclass("flex-1")}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={"#265881"}
            />}
          showsVerticalScrollIndicator={false}
        >
          {book ? (
            <>
              <LinearGradient
                colors={colorHeader}
                style={[twclass("p-2 rounded-3xl mx-2 android:mt-10")]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={twclass("flex-row justify-between mb-2")}>
                  <TouchableOpacity onPress={() => router.back()} style={twclass("flex-row items-center")}>
                    <Ionicons name='chevron-back' size={30} color={"white"} />
                    <TextTheme font='Prompt-SemiBold' size='xl' color='white' style={twclass("mt-0.5")}>กลับ</TextTheme>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteBook(bookId)} style={twclass("bg-red-500 p-2 rounded-3xl flex-row items-center")}>
                    <IconIonicons name='trash' size={30} style={twclass("text-white")} />
                    <TextTheme color='white'>ลบหนังสือเล่มนี้</TextTheme>
                  </TouchableOpacity>
                </View>
                <TextTheme font='Prompt-SemiBold' size='3xl' style={twclass("text-white p-5 pt-0")}>การตั้งค่าหนังสือ</TextTheme>

                <View style={twclass("flex-row gap-2 items-start p-5 pt-0")}>
                  <Image source={{ uri: `${apiUrl}${book.book_image}` }} style={twclass("h-[120px] w-[100px] rounded-xl")} />
                  <View style={twclass("basis-[70%]")}>
                    <TextTheme color='white' font='Prompt-SemiBold' size='lg'>{book.th_name}</TextTheme>
                    <TextTheme color='white' font='Prompt-Medium' size='base'>({book.eng_name})</TextTheme>
                  </View>
                </View>

                <View style={twclass(`p-5 flex-col`)}>
                  <View style={twclass("flex-col gap-2")}>
                    {[
                      { placeholder: "ชื่อหนังสือ (ภาษาไทย)", value: bookTitleThai, setter: setBookTitleThai },
                      { placeholder: "ชื่อหนังสือ (ภาษาอังกฤษ)", value: bookTitleEnglish, setter: setBookTitleEnglish }
                    ].map((field, i) => (
                      <View key={i}>
                        <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-white")}>
                          {field.placeholder} <TextTheme color='red-500' size='lg'>*</TextTheme>
                        </TextTheme>
                        <TextInput
                          style={[twclass("border-2 p-3 border-slate-300 rounded-xl bg-white"), { fontFamily: "Prompt-Regular" }]}
                          placeholder={field.placeholder}
                          placeholderTextColor={"#9E9E9E"}
                          autoCapitalize="none"
                          value={field.value}
                          onChangeText={field.setter}
                          textContentType={'oneTimeCode'}
                        />
                      </View>
                    ))}
                  </View>
                  {bookImage ? (
                    <View style={twclass("mt-5 flex-col justify-center items-center gap-2")}>
                      <Image source={{ uri: bookImage }} style={twclass("w-50 h-50 rounded-xl")} />
                      <TouchableOpacity onPress={() => setBookImage(null)} style={twclass("bg-red-500 p-2 rounded-xl flex-row mx-20 items-center")}>
                        <IconIonicons name='trash' size={30} style={twclass("text-white")} />
                        <TextTheme color='white'>ลบรูปภาพ</TextTheme>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => pickImage()} style={twclass(`flex-row gap-2 items-center bg-${book.color}-500 rounded-xl p-2 mt-3`)}>
                      <IconIonicons name='image' style={twclass("text-white")} />
                      <TextTheme font='Prompt-SemiBold' size='xl' style={twclass(`text-white`)}>เปลี่ยนรูปปกหนังสือ</TextTheme>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>

              <View style={twclass("flex-row p-5 justify-end")}>
                <TouchableOpacity onPress={submitSaveForm} style={twclass("bg-green-500 p-2 rounded-xl flex-row gap-2")}>
                  <IconIonicons name='save' color={"white"} />
                  <TextTheme color='white' size='xl'>บันทึก</TextTheme>
                </TouchableOpacity>
              </View>
            </>
          ) : <Loading />}
        </ScrollView>
      </SafeAreaView>

    </>
  )
}

export default Settings