import { Image, StyleSheet, Platform, View, Text, Button, FlatList } from 'react-native';

import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Load data from AsyncStorage when the app starts
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedBudget = await AsyncStorage.getItem("budget");
        const savedExpenses = await AsyncStorage.getItem("expenses");
        const savedTotalSpent = await AsyncStorage.getItem("totalSpent");

        // Parse and update state if data exists
        if (savedBudget) setBudget(parseInt(savedBudget));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedTotalSpent) setTotalSpent(parseInt(savedTotalSpent));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  // Save budget and expenses to AsyncStorage
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("budget", budget.toString());
        await AsyncStorage.setItem("expenses", JSON.stringify(expenses));
        await AsyncStorage.setItem("totalSpent", totalSpent.toString());
      } catch (error) {
        console.error("Failed to save data:", error);
      }
    };

    saveData();
  }, [budget, expenses, totalSpent]);

  const addExpense = () => {
    const newExpense = {
      id: expenses.length + 1,
      amount: Math.floor(Math.random() * 100), // Example: Random amount
    };
    setExpenses([...expenses, newExpense]);
    setTotalSpent(totalSpent + newExpense.amount);
  };

  const updateBudget = () => {
    const newBudget = Math.floor(Math.random() * 500) + 100; // Example: Random budget
    setBudget(newBudget);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
        <ThemedText type="title">FinButler</ThemedText>
      </ThemedView>

      {/* Budget and Expenses Summary */}
      <ThemedView style={styles.summary}>
        <ThemedText type="subtitle">Budget: ${budget}</ThemedText>
        <ThemedText type="subtitle">Total Spent: ${totalSpent}</ThemedText>
        <ThemedText type="subtitle">
          Remaining: ${Math.max(0, budget - totalSpent)}
        </ThemedText>
      </ThemedView>

      {/* Add Buttons */}
      <ThemedView style={styles.buttonsContainer}>
        <Button title="Add Expense" onPress={addExpense} />
        <Button title="Set Budget" onPress={updateBudget} />
      </ThemedView>

      {/* Expenses List */}
      <ThemedView style={styles.expensesList}>
        <ThemedText type="subtitle">Expenses:</ThemedText>
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ThemedText type="defaultSemiBold">- ${item.amount}</ThemedText>
          )}
        />
      </ThemedView>

      {/* Developer Tools Info */}
      <View style={styles.info}>
        <Text>
          Edit <Text style={{ fontWeight: "bold" }}>app/(tabs)/index.tsx</Text>{" "}
          to see changes. Press{" "}
          <Text style={{ fontWeight: "bold" }}>
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </Text>{" "}
          to open developer tools.
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reactLogo: {
    height: 50,
    width: 50,
    marginRight: 16,
  },
  summary: {
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  expensesList: {
    marginBottom: 16,
  },
  info: {
    marginTop: 16,
    padding: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
});
