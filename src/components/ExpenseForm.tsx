import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { BlurView } from 'expo-blur';

type ExpenseFormProps = {
  onSubmit: (expense: { item: string; amount: number; category: string; date: Date }) => void;
  onExpenseAdded?: () => void;
  selectedDate?: Date;
};

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];

export const ExpenseForm = ({ onSubmit, onExpenseAdded, selectedDate }: ExpenseFormProps) => {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const today = formatDate(selectedDate || new Date());

  const handleSubmit = async () => {
    try {
      if (!item.trim() || !amount || !category.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const validAmount = Number(amount);
      if (isNaN(validAmount) || validAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      if (onSubmit) {
        onSubmit({
          item: item.trim(),
          amount: validAmount,
          category: category.trim(),
          date: selectedDate || new Date()
        });
      }
      
      // Reset form
      setItem('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      Alert.alert('Error', 'Failed to submit expense. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={10} style={StyleSheet.absoluteFill} />
      
      <Text style={styles.dateText}>{today}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          placeholder="What did you spend on?"
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          value={item}
          onChangeText={setItem}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>RM</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="How much did you spend?"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.selectedCategory,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              category === cat && styles.selectedCategoryText
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(42, 42, 42, 0.85)',
    borderRadius: 16,
    gap: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4ecdc4',
    textShadowColor: 'rgba(78, 205, 196, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    color: '#fff',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencySymbol: {
    color: '#fff',
    fontSize: 16,
    paddingLeft: 16,
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCategory: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    borderColor: '#4ecdc4',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
