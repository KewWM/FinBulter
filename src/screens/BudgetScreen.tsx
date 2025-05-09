import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { ExpenseChart } from '../components/ExpenseChart';
import { ExpenseCalendar } from '../components/ExpenseCalendar';
import { Expense } from '../services/StorageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BudgetScreenProps = {
  expenses: Expense[];
  monthlyBudget: number;
  weeklyBudget: number;
  onSetBudget: (amount: number) => void;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
};

export const BudgetScreen = ({ 
  expenses, 
  monthlyBudget, 
  weeklyBudget,
  onSetBudget,
  onAddExpense,
  onDeleteExpense
}: BudgetScreenProps) => {
  const [newBudget, setNewBudget] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBudgetInput, setShowBudgetInput] = useState(!monthlyBudget);
  const insets = useSafeAreaInsets();

  const handleSetBudget = () => {
    const budget = parseFloat(newBudget);
    if (!isNaN(budget) && budget > 0) {
      onSetBudget(budget);
      setNewBudget('');
      setShowBudgetInput(false);
    } else {
      Alert.alert('Error', 'Please enter a valid budget amount');
    }
  };

  const getTodayExpenses = () => {
    const today = new Date();
    return expenses
      .filter(expense => expense.date.toDateString() === today.toDateString())
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getWeekExpenses = () => {
    const today = new Date();
    return expenses
      .filter(expense => {
        const diffTime = Math.abs(today.getTime() - expense.date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getDailyBudget = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return monthlyBudget / daysInMonth;
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = monthlyBudget - totalExpenses;
  const dailyBudget = getDailyBudget();
  const todayExpenses = getTodayExpenses();
  const weekExpenses = getWeekExpenses();

  return (
    <BackgroundLayout>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom + 20, 30) }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      >
        {showBudgetInput ? (
          <View style={[styles.card, styles.elevated]}>
            <Text style={styles.title}>Set Monthly Budget</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter monthly budget"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={newBudget}
              onChangeText={setNewBudget}
            />
            <TouchableOpacity style={styles.button} onPress={handleSetBudget}>
              <Text style={styles.buttonText}>Set Monthly Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, styles.elevated]}>
            <View style={styles.budgetHeader}>
              <View>
                <Text style={styles.title}>Budget Overview</Text>
                <Text style={styles.budgetAmount}>RM{monthlyBudget.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowBudgetInput(true)}
              >
                <Text style={styles.editButtonText}>Edit Budget</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.budgetInfo}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Daily Target:</Text>
                <View style={styles.targetContainer}>
                  <Text style={styles.budgetText}>
                    RM{todayExpenses.toFixed(2)} / RM{dailyBudget.toFixed(2)}
                  </Text>
                  {todayExpenses > dailyBudget && (
                    <Text style={styles.overBudget}>Over budget!</Text>
                  )}
                </View>
              </View>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Weekly Target:</Text>
                <View style={styles.targetContainer}>
                  <Text style={styles.budgetText}>
                    RM{weekExpenses.toFixed(2)} / RM{weeklyBudget.toFixed(2)}
                  </Text>
                  {weekExpenses > weeklyBudget && (
                    <Text style={styles.overBudget}>Over budget!</Text>
                  )}
                </View>
              </View>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Total Spent:</Text>
                <Text style={styles.expenseText}>RM{totalExpenses.toFixed(2)}</Text>
              </View>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Remaining:</Text>
                <Text style={[styles.remainingText, remainingBudget < 0 && styles.negative]}>
                  RM{remainingBudget.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.card, styles.viewToggle]}>
          <TouchableOpacity 
            style={[styles.toggleButton, !showCalendar && styles.activeToggle]} 
            onPress={() => setShowCalendar(false)}
          >
            <Text style={styles.toggleText}>Chart View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, showCalendar && styles.activeToggle]}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.toggleText}>Calendar View</Text>
          </TouchableOpacity>
        </View>

        {showCalendar ? (
          <ExpenseCalendar 
            expenses={expenses}
            monthlyBudget={monthlyBudget}
            onAddExpense={onAddExpense}
            onDeleteExpense={onDeleteExpense}
          />
        ) : (
          <ExpenseChart 
            expenses={expenses}
            timeframe="weekly"
          />
        )}
      </ScrollView>
    </BackgroundLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: 'rgba(42, 42, 42, 0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginTop: 4,
    textShadowColor: 'rgba(78, 205, 196, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  editButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  budgetInfo: {
    gap: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  budgetLabel: {
    fontSize: 16,
    color: '#999',
  },
  budgetText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  expenseText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 16,
    color: '#4ecdc4',
    fontWeight: '600',
  },
  negative: {
    color: '#ff6b6b',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    marginVertical: 12,
  },
  button: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  targetContainer: {
    alignItems: 'flex-end',
  },
  overBudget: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 2,
  },
});