import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const DetailsScreen = ({ route }) => {
  const { imageBase64, text } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageBase64 }} style={styles.image} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 20,
  },
});

export default DetailsScreen;
