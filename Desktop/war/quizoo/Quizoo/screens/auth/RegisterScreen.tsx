import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';
import Colors from '../../constants/Colors';
import * as Animatable from 'react-native-animatable';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthRootStackParamList, RootStackParamList } from '../../types/types';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !guardianName || !schoolName || !mobile) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert('Error', 'Mobile number should be 10 digits');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      Alert.alert('Success', 'Verification email sent');

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        guardianName,
        schoolName,
        mobile,
        createdAt: new Date(),
      });

      navigation.navigate('VerifyEmail');
    } catch (error: any) {
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Skip Button */}
        <TouchableOpacity
          onPress={() => navigation.replace('Home')} // or any screen you want to skip to
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip for now {'->'}</Text>
        </TouchableOpacity>

        <Animatable.View animation="fadeInUp" duration={800} style={{ width: '100%' }}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../../assets/lottie/register_quizoo.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>

          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Student Name"
            placeholderTextColor={Colors.gray}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Guardian's Name"
            placeholderTextColor={Colors.gray}
            value={guardianName}
            onChangeText={setGuardianName}
          />
          <TextInput
            style={styles.input}
            placeholder="School Name"
            placeholderTextColor={Colors.gray}
            value={schoolName}
            onChangeText={setSchoolName}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor={Colors.gray}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="number-pad"
            maxLength={10}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <CustomButton title="Register" onPress={handleRegister} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  lottieContainer: {
    alignItems: 'center',
    marginBottom: 10,
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
    width: '100%',
    height: 50,
    borderColor: Colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    color: Colors.text,
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  linkBold: {
    fontWeight: 'bold',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
    padding: 10,
  },
  skipText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
