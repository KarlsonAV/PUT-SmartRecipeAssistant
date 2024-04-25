// SignUpScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { createUserWithEmailAndPassword, getAuth } from "@firebase/auth";
import { app } from "../configs/firebase";
import { styles } from "../auth_styles";

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
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Sign Up</Text>
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
        <Button title="Sign Up" onPress={handleSignUp} color="#3498db" />
        <Text style={styles.toggleText} onPress={() => onAuthChange(true)}>
          Already have an account? Sign In
        </Text>
      </View>
    </ScrollView>
  );
};
