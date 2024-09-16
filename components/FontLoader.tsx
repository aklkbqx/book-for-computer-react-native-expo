import { useFonts } from 'expo-font';
import { useEffect, useState, ReactNode } from 'react';

const fontsPrompt = {
  "Prompt-Black": require(`@/assets/fonts/Prompt/Prompt-Black.ttf`),
  "Prompt-BlackItalic": require(`@/assets/fonts/Prompt/Prompt-BlackItalic.ttf`),
  "Prompt-Bold": require(`@/assets/fonts/Prompt/Prompt-Bold.ttf`),
  "Prompt-BoldItalic": require(`@/assets/fonts/Prompt/Prompt-BoldItalic.ttf`),
  "Prompt-ExtraBold": require(`@/assets/fonts/Prompt/Prompt-ExtraBold.ttf`),
  "Prompt-ExtraBoldItalic": require(`@/assets/fonts/Prompt/Prompt-ExtraBoldItalic.ttf`),
  "Prompt-ExtraLight": require(`@/assets/fonts/Prompt/Prompt-ExtraLight.ttf`),
  "Prompt-ExtraLightItalic": require(`@/assets/fonts/Prompt/Prompt-ExtraLightItalic.ttf`),
  "Prompt-Italic": require(`@/assets/fonts/Prompt/Prompt-Italic.ttf`),
  "Prompt-Light": require(`@/assets/fonts/Prompt/Prompt-Light.ttf`),
  "Prompt-LightItalic": require(`@/assets/fonts/Prompt/Prompt-LightItalic.ttf`),
  "Prompt-Medium": require(`@/assets/fonts/Prompt/Prompt-Medium.ttf`),
  "Prompt-MediumItalic": require(`@/assets/fonts/Prompt/Prompt-MediumItalic.ttf`),
  "Prompt-Regular": require(`@/assets/fonts/Prompt/Prompt-Regular.ttf`),
  "Prompt-SemiBold": require(`@/assets/fonts/Prompt/Prompt-SemiBold.ttf`),
  "Prompt-SemiBoldItalic": require(`@/assets/fonts/Prompt/Prompt-SemiBoldItalic.ttf`),
  "Prompt-Thin": require(`@/assets/fonts/Prompt/Prompt-Thin.ttf`),
  "Prompt-ThinItalic": require(`@/assets/fonts/Prompt/Prompt-ThinItalic.ttf`),
};

interface FontLoaderProps {
  children: ReactNode;
}

const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
  const [loaded] = useFonts(fontsPrompt);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (loaded) {
      setIsReady(true);
    }
  }, [loaded]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}

export default FontLoader;
