import React, { useEffect, useState, useCallback } from 'react';
import { View, Modal, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import IconIonicons from '@/components/IconIonicons';
import { apiUrl } from '@/helper/api';
import { resizeImage } from '@/helper/my-lib';
import twclass from '@/constants/twclass';
import TextTheme from '@/components/TextTheme';
import { useStatusBar } from '@/hook/useStatusBar';
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';
import Loading from '@/components/Loading';

interface ContentBlock {
  text: string;
  image: { uri: string | null; type: string; name: string };
}

interface ChapterBlock {
  chapter: string;
  label: string;
  sections: {
    title: string;
    content: {
      text: string;
      image: { uri: string | null; type: string; name: string };
      imageCredit?: { des: string; ref: string };
    }[];
  }[];
}

const colorOptions = ["rose", "pink", "fuchsia", "purple", "violet", "indigo", "blue", "sky", "cyan", "teal", "emerald", "green", "lime", "yellow", "amber", "orange", "red", "gray"];

const AddBook: React.FC = () => {
  useStatusBar("light-content");
  const [modalVisible, setModalVisible] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([{ text: '', image: { uri: null, type: '', name: '' } }]);
  const [chapterBlocks, setChapterBlocks] = useState<ChapterBlock[]>([{
    chapter: '',
    label: '',
    sections: [{ title: '', content: [{ text: '', image: { uri: null, type: '', name: '' } }] }]
  }]);
  const [bookTitleThai, setBookTitleThai] = useState('');
  const [bookTitleEnglish, setBookTitleEnglish] = useState('');
  const [bookImage, setBookImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("rose");
  const [isChecked, setChecked] = useState(false);
  const [bookType, setBookType] = useState("data");
  const [canSave, setCanSave] = useState<boolean>(false);

  useEffect(() => {
    setBookType(isChecked ? "topic" : "data");
  }, [isChecked]);

  const updateContentBlocks = useCallback((index: number, updates: Partial<ContentBlock>) => {
    setContentBlocks(prevBlocks => prevBlocks.map((block, i) => i === index ? { ...block, ...updates } : block));
  }, []);

  const updateChapterBlocks = useCallback((chapterIndex: number, sectionIndex: number, contentIndex: number, updates: Partial<ChapterBlock['sections'][0]['content'][0]> & { title?: string }) => {
    setChapterBlocks(prevBlocks => prevBlocks.map((chapter, cIndex) =>
      cIndex === chapterIndex
        ? {
          ...chapter,
          sections: chapter.sections.map((section, sIndex) =>
            sIndex === sectionIndex
              ? {
                ...section,
                title: updates.title !== undefined ? updates.title : section.title,
                content: section.content.map((content, coIndex) =>
                  coIndex === contentIndex
                    ? {
                      ...content,
                      ...updates,
                      imageCredit: updates.imageCredit
                        ? {
                          des: updates.imageCredit.des || content.imageCredit?.des || '',
                          ref: updates.imageCredit.ref || content.imageCredit?.ref || ''
                        }
                        : content.imageCredit
                    }
                    : content
                )
              }
              : section
          )
        }
        : chapter
    ));
  }, []);

  const updateChapter = useCallback((chapterIndex: number, updates: Partial<ChapterBlock>) => {
    setChapterBlocks(prevBlocks => prevBlocks.map((chapter, index) =>
      index === chapterIndex ? { ...chapter, ...updates } : chapter
    ));
  }, []);

  const addSection = useCallback((chapterIndex: number) => {
    setChapterBlocks(prevBlocks => prevBlocks.map((chapter, index) =>
      index === chapterIndex
        ? {
          ...chapter,
          sections: [...chapter.sections, { title: '', content: [{ text: '', image: { uri: null, type: '', name: '' } }] }]
        }
        : chapter
    ));
  }, []);

  const addContent = useCallback((chapterIndex: number, sectionIndex: number) => {
    setChapterBlocks(prevBlocks => prevBlocks.map((chapter, cIndex) =>
      cIndex === chapterIndex
        ? {
          ...chapter,
          sections: chapter.sections.map((section, sIndex) =>
            sIndex === sectionIndex
              ? {
                ...section,
                content: [...section.content, { text: '', image: { uri: null, type: '', name: '' } }]
              }
              : section
          )
        }
        : chapter
    ));
  }, []);

  const deleteContent = useCallback((chapterIndex: number, sectionIndex: number, contentIndex: number) => {
    setChapterBlocks(prevBlocks => prevBlocks.map((chapter, cIndex) =>
      cIndex === chapterIndex
        ? {
          ...chapter,
          sections: chapter.sections.map((section, sIndex) =>
            sIndex === sectionIndex
              ? {
                ...section,
                content: section.content.filter((_, coIndex) => coIndex !== contentIndex)
              }
              : section
          )
        }
        : chapter
    ));
  }, []);

  const deleteSection = useCallback((chapterIndex: number, sectionIndex: number) => {
    setChapterBlocks(prevBlocks => prevBlocks.map((chapter, cIndex) =>
      cIndex === chapterIndex
        ? {
          ...chapter,
          sections: chapter.sections.filter((_, sIndex) => sIndex !== sectionIndex)
        }
        : chapter
    ));
  }, []);

  const handleImagePicker = useCallback(async (isBookImage: boolean, chapterIndex?: number, sectionIndex?: number, contentIndex?: number) => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted) {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const resizedImage = await resizeImage(pickerResult.assets[0].uri, isBookImage ? 120 : 200, isBookImage ? 100 : 200);
        if (isBookImage) {
          setBookImage(resizedImage.uri);
        } else if (chapterIndex !== undefined && sectionIndex !== undefined && contentIndex !== undefined) {
          updateChapterBlocks(chapterIndex, sectionIndex, contentIndex, {
            image: { uri: resizedImage.uri, type: 'image/jpeg', name: `chapter_image_${chapterIndex}_${sectionIndex}_${contentIndex}.jpeg` }
          });
        } else if (!isBookImage) {
          updateContentBlocks(chapterIndex!, { image: { uri: resizedImage.uri, type: 'image/jpeg', name: `content_image_${chapterIndex}.jpeg` } });
        }
      }
    }
  }, [updateChapterBlocks, updateContentBlocks]);

  const submitAddBook = useCallback(async () => {
    setModalVisible(true);
    const formData = new FormData();
    formData.append('th_name', bookTitleThai);
    formData.append('eng_name', bookTitleEnglish);
    formData.append('color', selectedColor);
    formData.append('book_image', bookImage ? { uri: bookImage, type: 'image/jpeg', name: 'book_image.jpeg' } : '' as any);
    formData.append('type', bookType);

    try {
      const response = await fetch(`${apiUrl}/api/v1/books/add`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
      });

      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add book");

      const formDataContent = new FormData();
      formDataContent.append("book_id", data.book_id);
      formDataContent.append("type", bookType);

      if (bookType === 'data') {
        contentBlocks.forEach((block, index) => {
          formDataContent.append(`content[${index}][text]`, block.text);
          if (block.image.uri) {
            formDataContent.append(`content[${index}][image]`, {
              uri: block.image.uri,
              type: 'image/jpeg',
              name: `content_image_${index}.jpeg`
            } as any);
          }
        });
      } else {
        chapterBlocks.forEach((chapter, chapterIndex) => {
          formDataContent.append(`chapters[${chapterIndex}][chapter]`, chapter.chapter);
          formDataContent.append(`chapters[${chapterIndex}][label]`, chapter.label);
          chapter.sections.forEach((section, sectionIndex) => {
            formDataContent.append(`chapters[${chapterIndex}][sections][${sectionIndex}][title]`, section.title);
            section.content.forEach((content, contentIndex) => {
              formDataContent.append(`chapters[${chapterIndex}][sections][${sectionIndex}][content][${contentIndex}][text]`, content.text);
              if (content.image.uri) {
                formDataContent.append(`chapters[${chapterIndex}][sections][${sectionIndex}][content][${contentIndex}][image]`, {
                  uri: content.image.uri,
                  type: 'image/jpeg',
                  name: `chapter_image_${chapterIndex}_${sectionIndex}_${contentIndex}.jpeg`
                } as any);
              }
              if (content.imageCredit) {
                formDataContent.append(`chapters[${chapterIndex}][sections][${sectionIndex}][content][${contentIndex}][imageCredit][des]`, content.imageCredit.des);
                formDataContent.append(`chapters[${chapterIndex}][sections][${sectionIndex}][content][${contentIndex}][imageCredit][ref]`, content.imageCredit.ref);
              }
            });
          });
        });
      }

      const responseContent = await fetch(`${apiUrl}/api/v1/books/content/add`, {
        method: 'POST',
        body: formDataContent,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
      });

      if (!responseContent.ok) throw new Error("Failed to add content");
      if (Platform.OS !== "web") {
        Alert.alert("Success", "เพิ่มหนังสือสำเร็จ​!", [{ text: "OK", onPress: () => router.back() }]);
      } else {
        if (confirm("เพิ่มหนังสือสำเร็จ​!") == true) {
          router.back();
        };
      }
    } catch (error) {
      console.error("Error in submitAddBook:", error);
      Alert.alert("Error", "Unable to add book", [{ text: "OK" }]);
    } finally {
      setModalVisible(false);
    }
  }, [bookTitleThai, bookTitleEnglish, selectedColor, bookImage, bookType, contentBlocks, chapterBlocks]);

  useEffect(() => {
    const isBookTitleThaiFilled = bookTitleThai.trim() !== '';
    const isBookTitleEnglishFilled = bookTitleEnglish.trim() !== '';
    const isBookImageSelected = bookImage !== null;
    const isBookTypeSelected = bookType.trim() !== '';
    setCanSave(isBookTitleThaiFilled && isBookTitleEnglishFilled && isBookImageSelected && isBookTypeSelected);
  }, [bookTitleThai, bookTitleEnglish, bookImage, bookType]);

  const renderContentBlocks = () => (
    contentBlocks.map((block, index) => (
      <View key={index} style={twclass("flex-col gap-2 my-4")}>
        <View style={twclass("flex-row justify-between")}>
          <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-sky-800")}>
            เนื้อหาที่ {index + 1}
          </TextTheme>
          <TouchableOpacity onPress={() => setContentBlocks(blocks => blocks.filter((_, i) => i !== index))} style={twclass("flex-row gap-2 items-center justify-end")}>
            <View style={twclass("bg-red-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center")}>
              <IconIonicons name='trash' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
            </View>
            <TextTheme font='Prompt-SemiBold' size='base' color='red-500'>ลบเนื้อหา</TextTheme>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[twclass("border-2 p-3 border-slate-300 rounded-xl h-[150px] bg-white"), { fontFamily: "Prompt-Regular" }]}
          placeholder="เนื้อหาของหนังสือ"
          placeholderTextColor={"#9E9E9E"}
          value={block.text}
          onChangeText={(text) => updateContentBlocks(index, { text })}
          multiline={true}
          textContentType={'oneTimeCode'}
        />
        {block.image.uri ? (
          <View style={twclass("flex-col items-start gap-2")}>
            <Image source={{ uri: block.image.uri }} style={twclass("w-30 h-30 rounded-lg")} />
            <TouchableOpacity onPress={() => updateContentBlocks(index, { image: { uri: null, type: '', name: '' } })} style={twclass("flex-row gap-2 items-center justify-end")}>
              <View style={twclass("bg-red-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center")}>
                <IconIonicons name='trash' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
              </View>
              <TextTheme font='Prompt-SemiBold' size='base' color='red-500'>ลบรูปภาพ</TextTheme>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => handleImagePicker(false, index)} style={twclass("flex-row gap-2 items-center")}>
            <View style={twclass("bg-sky-800 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center relative")}>
              <IconIonicons name='image' color={"white"} style={twclass("text-xl absolute top-0.5 left-1.3")} />
            </View>
            <TextTheme font='Prompt-SemiBold' size='base' color='sky-800'>เพิ่มรูปภาพ (200x200px)</TextTheme>
          </TouchableOpacity>
        )}
      </View>
    ))
  );

  const renderChapterBlocks = () => (
    chapterBlocks.map((chapter, chapterIndex) => (
      <View key={chapterIndex} style={twclass("my-4 rounded-xl border-2 border-zinc-200 p-2 bg-white")}>
        <View style={twclass("flex-row gap-2 items-center")}>
          <TouchableOpacity onPress={() => setChapterBlocks(blocks => blocks.filter((_, i) => i !== chapterIndex))} style={twclass("bg-red-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center mt-3")}>
            <IconIonicons name='trash' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
          </TouchableOpacity>
          <View style={twclass("basis-[25%]")}>
            <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-sky-800")}>
              บทเรียนที่
            </TextTheme>
            <TextInput
              style={[twclass("border-2 p-3 border-slate-300 rounded-xl mb-2 bg-white"), { fontFamily: "Prompt-Regular" }]}
              placeholder="บทที่"
              value={chapter.chapter}
              onChangeText={(text) => updateChapter(chapterIndex, { chapter: text })}
            />
          </View>

          <View style={twclass("flex-1")}>
            <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-sky-800")}>
              ชื่อบทเรียน
            </TextTheme>
            <TextInput
              style={[twclass("border-2 p-3 border-slate-300 rounded-xl mb-2 bg-white"), { fontFamily: "Prompt-Regular" }]}
              placeholder="ชื่อบท"
              value={chapter.label}
              onChangeText={(text) => updateChapter(chapterIndex, { label: text })}
            />
          </View>
        </View>
        {chapter.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={twclass("bg-slate-100 rounded-xl border-2 border-slate-200 p-2 my-2")}>
            <TouchableOpacity onPress={() => deleteSection(chapterIndex, sectionIndex)} style={twclass("flex-row gap-1 items-center justify-end mb-2")}>
              <View style={twclass("bg-red-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center")}>
                <IconIonicons name='remove-sharp' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
              </View>
              <TextTheme font='Prompt-SemiBold' size='base' color='red-500'>ลบหัวข้อย่อย</TextTheme>
            </TouchableOpacity>

            {section.content.map((content, contentIndex) => (
              <View key={contentIndex} style={twclass("border border-slate-300 rounded-xl p-2 mb-2 bg-slate-200")}>
                <View style={twclass("flex-row gap-2 items-center")}>
                  <TouchableOpacity onPress={() => deleteContent(chapterIndex, sectionIndex, contentIndex)} style={twclass("flex-row gap-1 items-center justify-start mb-2")}>
                    <View style={twclass("bg-red-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center")}>
                      <IconIonicons name='remove-sharp' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
                    </View>
                    <TextTheme font='Prompt-SemiBold' size='base' color='red-500'>ลบเนื้อหา</TextTheme>
                  </TouchableOpacity>
                  <TextInput
                    style={[twclass("border-2 p-3 border-slate-300 rounded-xl mb-2 bg-white flex-1"), { fontFamily: "Prompt-Regular" }]}
                    placeholder="หัวข้อ"
                    value={section.title}
                    onChangeText={(text) => updateChapterBlocks(chapterIndex, sectionIndex, 0, { title: text })}
                  />
                </View>
                <TextInput
                  style={[twclass("border-2 p-3 border-slate-300 rounded-xl mb-2 h-[150px] bg-white"), { fontFamily: "Prompt-Regular" }]}
                  placeholder="เนื้อหา"
                  value={content.text}
                  onChangeText={(text) => updateChapterBlocks(chapterIndex, sectionIndex, contentIndex, { text })}
                  multiline
                />
                {content.image.uri ? (
                  <View style={twclass("px-5")}>
                    <View style={twclass("flex-col items-center gap-2")}>
                      <Image source={{ uri: content.image.uri }} style={twclass("w-30 h-30 rounded-lg")} />
                      <TouchableOpacity onPress={() => updateChapterBlocks(chapterIndex, sectionIndex, contentIndex, { image: { uri: null, type: '', name: '' } })} style={twclass("flex-row gap-2 items-center justify-end mb-2")}>
                        <View style={twclass("bg-red-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center")}>
                          <IconIonicons name='trash' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
                        </View>
                        <TextTheme font='Prompt-SemiBold' size='base' color='red-500'>ลบรูปภาพ</TextTheme>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[twclass("border-2 p-3 border-slate-300 rounded-xl mb-2 bg-white"), { fontFamily: "Prompt-Regular" }]}
                      placeholder="คำอธิบายของรูปภาพ"
                      value={content.imageCredit?.des || ''}
                      onChangeText={(text) => updateChapterBlocks(chapterIndex, sectionIndex, contentIndex, {
                        imageCredit: {
                          ...content.imageCredit,
                          des: text,
                          ref: content.imageCredit?.ref || ''
                        }
                      })}
                    />
                    <TextInput
                      style={[twclass("border-2 p-3 border-slate-300 rounded-xl mb-2 bg-white"), { fontFamily: "Prompt-Regular" }]}
                      placeholder="แหล่งที่มาของรูปภาพ"
                      value={content.imageCredit?.ref || ''}
                      onChangeText={(text) => updateChapterBlocks(chapterIndex, sectionIndex, contentIndex, {
                        imageCredit: {
                          ...content.imageCredit,
                          des: content.imageCredit?.des || '',
                          ref: text
                        }
                      })}
                    />
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => handleImagePicker(false, chapterIndex, sectionIndex, contentIndex)} style={twclass("flex-row gap-2 items-center my-2")}>
                    <View style={twclass("bg-sky-800 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center relative")}>
                      <IconIonicons name='image' color={"white"} style={twclass("text-xl absolute top-0.5 left-1.3")} />
                    </View>
                    <TextTheme font='Prompt-SemiBold' size='base' color='sky-800'>เพิ่มรูปภาพ (200x200px)</TextTheme>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity onPress={() => addContent(chapterIndex, sectionIndex)} style={twclass("flex-row gap-2 items-center justify-center bg-green-500 rounded-xl p-2")}>
              <View style={twclass("bg-white rounded-xl p-1 w-[30px] h-[30px] justify-center items-center relative")}>
                <IconIonicons name='add' style={twclass("text-xl absolute top-0.5 left-1.3 text-green-500")} />
              </View>
              <TextTheme font='Prompt-SemiBold' size='base' color='white'>เพิ่มเนื้อหา</TextTheme>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={() => addSection(chapterIndex)} style={twclass("flex-row gap-2 items-center justify-center my-2 bg-slate-100 rounded-xl p-2 mx-20")}>
          <View style={twclass("bg-green-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center relative")}>
            <IconIonicons name='add' color={"white"} style={twclass("text-xl absolute top-0.5 left-1.3")} />
          </View>
          <TextTheme font='Prompt-SemiBold' size='base' color='green-500'>เพิ่มหัวข้อย่อย</TextTheme>
        </TouchableOpacity>
      </View>
    ))
  );

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

      <ScrollView style={twclass("flex-1 p-5")}>
        <TextTheme font='Prompt-SemiBold' size='3xl' style={twclass("text-sky-800 pt-2")}>เพิ่มหนังสือ</TextTheme>
        <View style={twclass("mt-4 flex-col gap-2")}>
          {[
            { placeholder: "ชื่อหนังสือ (ภาษาไทย)", value: bookTitleThai, setter: setBookTitleThai },
            { placeholder: "ชื่อหนังสือ (ภาษาอังกฤษ)", value: bookTitleEnglish, setter: setBookTitleEnglish }
          ].map((field, i) => (
            <View key={i}>
              <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-sky-800")}>
                {field.placeholder} <TextTheme color='red-500' size='lg'>*</TextTheme>
              </TextTheme>
              <TextInput
                style={[twclass("border-2 p-3 border-slate-300 rounded-xl"), { fontFamily: "Prompt-Regular" }]}
                placeholder={field.placeholder}
                placeholderTextColor={"#9E9E9E"}
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.setter}
                textContentType={'oneTimeCode'}
              />
            </View>
          ))}

          <View>
            <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-sky-800")}>
              สีของหนังสือ <TextTheme color='red-500' size='lg'>*</TextTheme>
            </TextTheme>
            <View style={twclass("flex-row gap-2 flex-wrap")}>
              {colorOptions.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={twclass(`basis-[40px] h-[40px] rounded-full bg-${color.toLowerCase()}-400`)}
                  onPress={() => setSelectedColor(color)}>
                  {selectedColor === color && (
                    <IconIonicons
                      name='checkmark-circle'
                      style={twclass("absolute z-9 bottom-[-5px] right-[-5px] text-white")}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-sky-800")}>
              ปกหนังสือ <TextTheme color='red-500' size='lg'>*</TextTheme>
            </TextTheme>
            {bookImage ? (
              <View style={twclass("flex-row items-start justify-between")}>
                <Image source={{ uri: bookImage }} style={twclass("w-50 h-50 rounded-lg")} />
                <TouchableOpacity onPress={() => setBookImage(null)} style={twclass("flex-row gap-2 items-center justify-end")}>
                  <View style={twclass("bg-red-500 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center relative")}>
                    <IconIonicons name='trash' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
                  </View>
                  <TextTheme font='Prompt-SemiBold' size='base' color='red-500'>ลบรูปภาพ</TextTheme>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => handleImagePicker(true)} style={twclass("flex-row gap-2 items-center")}>
                <View style={twclass("bg-sky-800 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center relative")}>
                  <IconIonicons name='image' color={"white"} style={twclass("text-xl absolute top-0.5 left-1.3")} />
                </View>
                <TextTheme font='Prompt-SemiBold' size='base' color='sky-800'>เพิ่มรูปภาพ (120x100px)</TextTheme>
              </TouchableOpacity>
            )}
          </View>
          <View>
            <View style={twclass("flex-row gap-2 items-center")}>
              <TextTheme font='Prompt-SemiBold' size='base' style={twclass("text-sky-800 mt-2")}>
                ประเภทหนังสือ:
              </TextTheme>
              <TextTheme font='Prompt-SemiBold' size='base' style={twclass(`text-red-800 mt-2`)}>
                {bookType == "data" ? "เนื้อหาทั้งหมด" : "เนื้อหามีบทย่อย"}
              </TextTheme>
            </View>
            <TouchableOpacity onPress={() => setChecked(!isChecked)} style={twclass("flex-row gap-2 items-center")}>
              <Checkbox value={isChecked} onValueChange={setChecked} style={twclass("rounded-1.5")} color={`${twclass("bg-sky-800").backgroundColor}`} />
              <TextTheme size='base' style={twclass("text-sky-800")}>
                ต้องการเพิ่มหนังสือเป็นแบบแยกบทเรียนหรือไม่​?
              </TextTheme>
            </TouchableOpacity>
          </View>
        </View>

        <View style={twclass("border border-sky-800 mt-5 opacity-20")} />

        <View style={twclass("mt-5")}>
          <TextTheme font='Prompt-SemiBold' size='2xl' style={twclass("text-sky-800")}>{!isChecked ? "เนื้อหาของหนังสือ" : "เพิ่มบทเรียน"}</TextTheme>
          {!isChecked ? renderContentBlocks() : renderChapterBlocks()}
          <TouchableOpacity
            onPress={() => isChecked
              ? setChapterBlocks([...chapterBlocks, { chapter: '', label: '', sections: [{ title: '', content: [{ text: '', image: { uri: null, type: '', name: '' } }] }] }])
              : setContentBlocks([...contentBlocks, { text: '', image: { uri: null, type: '', name: '' } }])
            }
            style={twclass("flex-row gap-2 items-center justify-center bg-sky-800 mx-20 rounded-xl p-2 mb-5")}
          >
            <View style={twclass("bg-white rounded-xl p-1 w-[30px] h-[30px] justify-center items-center relative")}>
              <IconIonicons name='add' style={twclass("text-xl absolute top-0.5 left-1.3 text-sky-900")} />
            </View>
            <TextTheme font='Prompt-SemiBold' size='base' color='white'>{isChecked ? "เพิ่มบทเรียน" : "เพิ่มเนื้อหา"}</TextTheme>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={submitAddBook} style={twclass(`bg-sky-800 p-4 rounded-2xl flex-row gap-2 mb-20 ${!canSave ? "opacity-50" : ""}`)} disabled={!canSave}>
          <IconIonicons name='save' color={"white"} />
          <TextTheme font='Prompt-SemiBold' size='lg' color='white'>บันทึก</TextTheme>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default AddBook;