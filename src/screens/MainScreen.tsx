import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Expense } from '../services/StorageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MainScreenProps = {
  expenses: Expense[];
  onAddExpense: (expense: { item: string; amount: number; category: string; date?: Date }) => void;
  onDeleteExpense: (id: string) => void;
};

export const MainScreen = ({ expenses, onAddExpense, onDeleteExpense }: MainScreenProps) => {
  const insets = useSafeAreaInsets();

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
        <ExpenseForm 
          onSubmit={onAddExpense}
          selectedDate={new Date()}
        />
        <ExpenseList 
          expenses={expenses}
          timeframe="daily"
          onDeleteExpense={onDeleteExpense}
        />
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
});