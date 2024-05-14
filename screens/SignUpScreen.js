// SignUpScreen.js
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
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword, getAuth } from "@firebase/auth";
import { app } from "../configs/firebase";
import { styles } from "../auth_styles";
import backgroundImage from "../assets/images/background.png";

export const SignUpScreen = ({ onAuthChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app);

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully!");
    } catch (error) {
      console.error("Signup error:", error.message);
      Alert.alert(
        "Signup Error",
        "Failed to create an account. Please try again."
      );
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
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.authContainer}>
                <Text style={styles.title}>WELCOME!</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="oneTimeCode"
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry
                  textContentType="oneTimeCode"
                />
                <View style={styles.buttonContainer}>
                  <Button
                    title="Sign Up"
                    onPress={handleSignUp}
                    color="#f97316"
                  />
                </View>
                <Text
                  style={styles.toggleText}
                  onPress={() => onAuthChange(true)}
                >
                  Already have an account? Sign In
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};
