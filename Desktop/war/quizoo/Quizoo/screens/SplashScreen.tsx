import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();

    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');
        console.log('[DEBUG] AsyncStorage isLoggedIn =>', value);

        setTimeout(() => {
          if (value?.toLowerCase() === 'true') {
            console.log('[DEBUG] Navigating to Home');
            navigation.replace('Home');
          } else {
            console.log('[DEBUG] Navigating to Auth');
            navigation.replace('Register');
          }
        }, 2000);
      } catch (e) {
        console.error('Error checking login status:', e);
        navigation.replace('Register');
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/main_logo.png')}
        style={[
          styles.logo,
          {
            opacity: logoAnim,
            transform: [{ scale: logoAnim }],
          },
        ]}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#3C47D7" style={{ marginTop: 30 }} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
});
