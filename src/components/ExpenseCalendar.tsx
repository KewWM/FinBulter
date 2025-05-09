import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ExpenseList } from './ExpenseList';

interface Month {
  year: number;
  month: number;
}
import { ExpenseForm } from './ExpenseForm';
import { Expense } from '../services/StorageService';
import { BlurView } from 'expo-blur';

type ExpenseCalendarProps = {
  expenses: Expense[];
  monthlyBudget: number;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
};

export const ExpenseCalendar = ({ expenses, monthlyBudget, onAddExpense, onDeleteExpense }: ExpenseCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
  });

  const calculateDailyBudget = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return monthlyBudget / daysInMonth;
  };

  const getWeeklyExpenses = (month: string) => {
    const [year, monthIndex] = month.split('-').map(Number);
    const firstDay = new Date(year, monthIndex - 1, 1);
    const lastDay = new Date(year, monthIndex, 0);
    
    const weeklyData = [];
    let currentWeekStart = new Date(firstDay);
    
    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekExpenses = expenses.filter(expense => {
        const expDate = new Date(expense.date);
        return expDate >= currentWeekStart && expDate <= weekEnd;
      });
      
      const weekTotal = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      weeklyData.push({
        start: new Date(currentWeekStart),
        end: weekEnd > lastDay ? lastDay : weekEnd,
        total: weekTotal,
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeklyData;
  };

  const getDayExpenses = (date: string) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toISOString().split('T')[0] === date;
    });
  };

  const getMarkedDates = () => {
    const markedDates: any = {};
    const dailyBudget = calculateDailyBudget();

    expenses.forEach(expense => {
      const dateStr = new Date(expense.date).toISOString().split('T')[0];
      const dayExpenses = getDayExpenses(dateStr);
      const totalAmount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      if (!markedDates[dateStr]) {
        markedDates[dateStr] = {
          marked: true,
          dotColor: totalAmount > dailyBudget ? '#ff6b6b' : '#4ecdc4'
        };
      }
    });

    if (selectedDate) {
      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: '#4ecdc4'
      };
    }

    return markedDates;
  };

  const handleAddExpense = (expense: { item: string; amount: number; category: string; date: Date }) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    onAddExpense(newExpense);
  };

  const handleMonthPress = (month: string) => {
    setSelectedMonth(month);
    setMonthModalVisible(true);
  };

  const getCurrentMonthName = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'rgba(26, 26, 26, 0.7)',
            textSectionTitleColor: 'rgba(255, 255, 255, 0.7)',
            selectedDayBackgroundColor: '#4ecdc4',
            selectedDayTextColor: '#fff',
            todayTextColor: '#4ecdc4',
            dayTextColor: '#fff',
            textDisabledColor: 'rgba(255, 255, 255, 0.3)',
            dotColor: '#4ecdc4',
            monthTextColor: '#fff',
            arrowColor: '#4ecdc4',
            textMonthFontWeight: 'bold',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
          markedDates={getMarkedDates()}
          onDayPress={(day: DateData) => {
            setSelectedDate(day.dateString);
            setModalVisible(true);
          }}
          onMonthChange={(month: any) => {
            setSelectedMonth(`${month.year}-${month.month}`);
          }}
        />
        <TouchableOpacity
          style={styles.monthlyButton}
          onPress={() => handleMonthPress(selectedMonth)}
        >
          <Text style={styles.monthlyButtonText}>
            View Monthly Overview - {getCurrentMonthName()}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={monthModalVisible}
        onRequestClose={() => setMonthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={10} style={StyleSheet.absoluteFill} />
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Monthly Summary - {getCurrentMonthName()}
              </Text>
              <TouchableOpacity 
                onPress={() => setMonthModalVisible(false)}
                style={styles.closeButtonContainer}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalContentContainer}
            >
              <View style={styles.monthlyBudgetInfo}>
                <Text style={styles.monthlyBudgetText}>Monthly Budget: RM{monthlyBudget.toFixed(2)}</Text>
                <Text style={styles.weeklyBudgetText}>Weekly Target: RM{(monthlyBudget / 4).toFixed(2)}</Text>
              </View>
              {getWeeklyExpenses(selectedMonth).map((week, index) => (
                <View key={index} style={styles.weekSummary}>
                  <View style={styles.weekHeader}>
                    <View style={styles.weekHeaderText}>
                      <Text style={styles.weekTitle}>Week {index + 1}</Text>
                      <Text style={styles.weekDates}>
                        {week.start.toLocaleDateString()} - {week.end.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.weekExpenseContainer}>
                    <View style={styles.weekAmountContainer}>
                      <Text style={[
                        styles.weekTotal,
                        week.total > (monthlyBudget / 4) ? styles.overBudget : null
                      ]}>
                        RM{week.total.toFixed(2)}
                      </Text>
                      <View style={styles.budgetComparison}>
                        <Text style={styles.budgetIndicator}>
                          Weekly Budget: RM{(monthlyBudget / 4).toFixed(2)}
                        </Text>
                        <View style={styles.progressBarContainer}>
                          <View 
                            style={[
                              styles.progressBar,
                              {
                                width: `${Math.min((week.total / (monthlyBudget / 4)) * 100, 100)}%`,
                                backgroundColor: week.total > (monthlyBudget / 4) ? '#ff6b6b' : '#4ecdc4'
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                    {week.total > (monthlyBudget / 4) && (
                      <Text style={styles.warningText}>
                        Exceeded by: RM{(week.total - (monthlyBudget / 4)).toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={10} style={StyleSheet.absoluteFill} />
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Expenses for {selectedDate}
              </Text>
              <Text style={styles.closeButton} onPress={() => setModalVisible(false)}>
                ✕
              </Text>
            </View>
            <ScrollView style={styles.modalContent}>
              <ExpenseForm 
                onSubmit={handleAddExpense}
                selectedDate={selectedDate ? new Date(selectedDate) : undefined}
                onExpenseAdded={() => {
                  // Optionally add feedback here
                }}
              />
              <ExpenseList
                expenses={getDayExpenses(selectedDate)}
                timeframe="daily"
                selectedDate={selectedDate ? new Date(selectedDate) : undefined}
                onDeleteExpense={onDeleteExpense}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarContainer: {
    backgroundColor: 'rgba(42, 42, 42, 0.85)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthlyButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthlyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.7)',
    padding: 8,
  },
  closeButtonContainer: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalContentContainer: {
    paddingBottom: 20,
  },
  monthlyBudgetInfo: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthlyBudgetText: {
    color: '#4ecdc4',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weeklyBudgetText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  weekSummary: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weekHeader: {
    marginBottom: 12,
  },
  weekHeaderText: {
    gap: 4,
  },
  weekTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  weekDates: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  weekExpenseContainer: {
    gap: 8,
  },
  weekAmountContainer: {
    gap: 8,
  },
  weekTotal: {
    color: '#4ecdc4',
    fontSize: 24,
    fontWeight: 'bold',
  },
  budgetComparison: {
    gap: 4,
  },
  budgetIndicator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  overBudget: {
    color: '#ff6b6b',
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
});
