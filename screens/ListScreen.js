// ListScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

import { app, getAuth, db } from "../configs/firebase";
import { useNavigation } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

const ListScreen = () => {
  const auth = getAuth(app);
  const userID = auth.currentUser.uid;

  const navigation = useNavigation();

  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const recipesRef = collection(db, "recipes");
    const q = query(
      recipesRef,
      where("userID", "==", userID),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecipes = [];
      snapshot.forEach((doc) => {
        fetchedRecipes.push({ id: doc.id, ...doc.data() });
      });
      setRecipes(fetchedRecipes);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Details", { image: item.imageURL, recipe: item });
      }}
    >
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.imageURL }} style={styles.image} />
        <Text style={styles.title}>{item.recipeName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    maxWidth: windowWidth - 120, // Adjusted max width to fit screen
  },
});

export default ListScreen;
