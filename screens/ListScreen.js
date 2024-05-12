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
  ImageBackground, // Import ImageBackground
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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.recipeName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.backgroundImage}
      >
        <Text style={styles.header}>My Recipes</Text>
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "space-between",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    marginTop: 20,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: "#A2B76A",
    flexDirection: "row", // Aligns children (image and text container) in a row
    alignItems: "center", // Centers children vertically in the container
    paddingVertical: 20,
    borderRadius: 24,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1, // Take up all available space beside the image
    justifyContent: "center", // Center text vertically
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    maxWidth: windowWidth - 140,
    flexShrink: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#FE8C45",
  },
});

export default ListScreen;
