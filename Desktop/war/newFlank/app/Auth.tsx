import React, { useState, useRef } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { getAuth, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { app } from "@/firebase/firebaseConfig"; // ✅ Make sure your firebaseConfig.ts is correctly set up
import { StackNavigationProp } from "@react-navigation/stack";

type Props = {
  navigation: StackNavigationProp<any, "PhoneAuth">;
};

const PRIMARY_COLOR = "#116530"; // ✅ Primary Color

const PhoneAuthScreen: React.FC<Props> = ({ navigation }) => {
  const auth = getAuth(app);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const sendOTP = async () => {
    try {
      if (!recaptchaVerifier.current) return;
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier.current);
      setVerificationId(verificationId);
      Alert.alert("OTP Sent", "Please check your SMS.");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const verifyOTP = async () => {
    try {
      if (!verificationId) return Alert.alert("Error", "No verification ID found.");
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      Alert.alert("Success", "Phone Number Verified!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={app.options} />
      <Text style={styles.title}>Phone Authentication</Text>
      <TextInput
        label="Phone Number"
        mode="outlined"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <Button mode="contained" onPress={sendOTP} style={styles.button}>
        Send OTP
      </Button>
      <TextInput
        label="Enter OTP"
        mode="outlined"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        style={styles.input}
      />
      <Button mode="contained" onPress={verifyOTP} style={styles.button}>
        Verify OTP
      </Button>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: PRIMARY_COLOR },
  input: { marginBottom: 15, backgroundColor: "#fff" },
  button: { backgroundColor: PRIMARY_COLOR, marginBottom: 10 },
});

export default PhoneAuthScreen;
