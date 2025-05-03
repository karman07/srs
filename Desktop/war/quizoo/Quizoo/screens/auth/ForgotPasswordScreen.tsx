import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import Colors from '../../constants/Colors';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthRootStackParamList } from '../../types/types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthRootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent');
        navigation.navigate('Login');
      })
      .catch(error => Alert.alert('Error', error.message));
  };

  return (
    <Animatable.View animation="fadeInUp" style={styles.container}>
      <View style={styles.lottieContainer}>
        <LottieView
          source={require('../../assets/lottie/forgot_password.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.gray}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <CustomButton title="Send Reset Email" onPress={handleResetPassword} />

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.borderButton}>
        <Text style={styles.borderButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  lottieContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lottie: {
    width: width * 0.6,
    height: width * 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: Colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    color: Colors.text,
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

export default ForgotPasswordScreen;
