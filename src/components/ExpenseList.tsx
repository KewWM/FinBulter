import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

type Expense = {
  id: string;
  item: string;
  amount: number;
  category: string;
  date: Date;
};

type ExpenseListProps = {
  expenses: Expense[];
  timeframe?: 'daily' | 'weekly' | 'monthly';
  selectedDate?: Date;
  onDeleteExpense?: (id: string) => void;
};

export const ExpenseList = ({ expenses, timeframe = 'daily', selectedDate, onDeleteExpense }: ExpenseListProps) => {
  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => onDeleteExpense?.(id),
          style: 'destructive'
        }
      ]
    );
  };

  const filteredExpenses = expenses.filter(expense => {
    const compareDate = selectedDate || new Date();
    if (timeframe === 'daily') {
      return expense.date.toDateString() === compareDate.toDateString();
    } else if (timeframe === 'weekly') {
      const diffTime = Math.abs(compareDate.getTime() - expense.date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    return true;
  });

  const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const categoryTotals = Object.entries(groupedExpenses).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  }));

  const totalSpent = categoryTotals.reduce((sum, { total }) => sum + total, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Expenses</Text>
        <Text style={styles.totalAmount}>Total: RM{totalSpent.toFixed(2)}</Text>
      </View>
      
      {categoryTotals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No expenses recorded for this period</Text>
        </View>
      ) : (
        categoryTotals.map(({ category, total }) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <Text style={styles.categoryTotal}>RM{total.toFixed(2)}</Text>
            </View>
            {groupedExpenses[category].map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseName}>{expense.item}</Text>
                  <Text style={styles.expenseDate}>
                    {expense.date.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.expenseActions}>
                  <Text style={styles.expenseAmount}>RM{expense.amount.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(expense.id)}
                  >
                    <Text style={styles.deleteButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(42, 42, 42, 0.85)',
    borderRadius: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ecdc4',
    textShadowColor: 'rgba(78, 205, 196, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  categorySection: {
    marginBottom: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ecdc4',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseName: {
    fontSize: 14,
    color: '#fff',
  },
  expenseAmount: {
    fontSize: 14,
    color: '#4ecdc4',
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
  },
  expenseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  deleteButtonText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
  }
});