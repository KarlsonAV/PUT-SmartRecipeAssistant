// LogInScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { app, getAuth } from "../configs/firebase";
import { styles } from "../auth_styles";

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
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <Button title="Sign In" onPress={handleLogin} color="#3498db" />
        <Text style={styles.toggleText} onPress={() => onAuthChange(false)}>
          Need an account? Sign Up
        </Text>
      </View>
    </ScrollView>
  );
};
