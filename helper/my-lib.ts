import * as ImageManipulator from 'expo-image-manipulator';


export const resizeImage = async (uri: string, img_w: number, img_h: number) => {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
            {
                resize: {
                    width: img_w,
                    height: img_h
                }
            },
            {
                crop: {
                    originX: 0,
                    originY: 0,
                    width: img_w,
                    height: img_h
                }
            }
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedImage;
};