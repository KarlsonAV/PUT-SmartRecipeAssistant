// ListScreen.js
import React from "react";
import { View, FlatList, Text, StyleSheet, SafeAreaView } from "react-native";

const ListScreen = () => {
  const elements = [
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" },
  ]; // Example items

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={elements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.text}</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export default ListScreen;
