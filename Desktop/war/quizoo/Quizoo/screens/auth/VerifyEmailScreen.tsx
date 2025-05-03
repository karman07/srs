import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import Colors from '../../constants/Colors';
import * as Animatable from 'react-native-animatable';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthRootStackParamList } from '../../types/types';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthRootStackParamList, 'VerifyEmail'>;
};

const VerifyEmailScreen: React.FC<Props> = ({ navigation }) => {
  const user = auth.currentUser;

  const handleResendEmail = () => {
    if (user) {
      sendEmailVerification(user)
        .then(() => {
          Alert.alert('Success', 'Verification email has been resent.');
        })
        .catch(error => {
          Alert.alert('Error', error.message);
        });
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('Login');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <Animatable.View animation="fadeInUp" style={styles.container}>
      <View style={styles.lottieContainer}>
        <LottieView
          source={require('../../assets/lottie/verify_email.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.description}>
        We've sent a verification link to your email address.
        Please verify your email to continue.
      </Text>

      <CustomButton title="Resend Email" onPress={handleResendEmail} />

      <TouchableOpacity onPress={handleLogout} style={styles.borderButton}>
        <Text style={styles.borderButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  lottieContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lottie: {
    width: width * 0.5,
    height: width * 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  borderButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  borderButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifyEmailScreen;
