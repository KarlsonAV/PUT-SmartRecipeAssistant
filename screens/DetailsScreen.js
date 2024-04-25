import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const DetailsScreen = ({ route }) => {
  const { image, recipe } = route.params;

  // Function to format ingredients with bullet points
  const renderIngredients = (ingredients) => {
    return ingredients.map((ingredient, index) => (
      <Text key={index} style={styles.details}>• {ingredient}</Text>
    ));
  };

  // Function to format steps with enumeration
  const renderSteps = (steps) => {
    return steps.map((step, index) => (
      <Text key={index} style={styles.details}>{index + 1}. {step}</Text>
    ));
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{recipe.recipeName}</Text>
          <Text style={styles.details}>Cooking Time: {recipe.cookingTime} mins</Text>
          <Text style={styles.details}>Servings: {recipe.servings}</Text>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {renderIngredients(recipe.ingredients)}
          <Text style={styles.sectionTitle}>Steps</Text>
          {renderSteps(recipe.steps)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 5,
  },
});

export default DetailsScreen;
