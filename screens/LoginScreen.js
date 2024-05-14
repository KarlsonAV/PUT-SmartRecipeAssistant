import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from "react-native";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { app, getAuth } from "../configs/firebase";
import { styles } from "../auth_styles";
import backgroundImage from "../assets/images/background.png";

export const LogInScreen = ({ onAuthChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in successfully!");
    } catch (error) {
      console.error("Login error:", error.message);
      Alert.alert("Login Error", "Invalid email or password. Please try again.");
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 20 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
              <View style={styles.authContainer}>
                <Text style={styles.title}>HELLO!</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType='oneTimeCode'
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry
                  textContentType='oneTimeCode'
                />
                <View style={styles.buttonContainer}>
                  <Button title="Sign In" onPress={handleLogin} color="#f97316" />
                </View>
                <Text style={styles.toggleText} onPress={() => onAuthChange(false)}>
                  Don't have an account? Sign up
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};
