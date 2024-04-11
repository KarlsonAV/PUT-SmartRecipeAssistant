// screens/LoginScreen.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const LoginScreen = ({ onLogin }) => {
  return (
    <View style={styles.container}>
      <Button title="Log In" onPress={onLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
