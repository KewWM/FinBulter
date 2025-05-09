import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainScreen } from './src/screens/MainScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { NotificationService } from './src/services/NotificationService';
import { StorageService, Expense } from './src/services/StorageService';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { BackgroundLayout } from './src/components/BackgroundLayout';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedLogo } from './src/components/AnimatedLogo';
import { View, StyleSheet, Image, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Image 
      source={require('./assets/FinBulter.png')}
      style={styles.loadingLogo}
      resizeMode="contain"
    />
    <Text style={styles.loadingTitle}>FinBulter</Text>
    <Text style={styles.loadingSubtitle}>Your Money Bulter</Text>
  </View>
);

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4ecdc4',
    background: '#1a1a1a',
    card: '#2a2a2a',
    text: '#ffffff',
    border: '#333333',
  },
};

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Set up notification handling first
      await NotificationService.initialize();
      
      // Then load data
      const storedExpenses = await StorageService.getExpenses();
      const storedMonthlyBudget = await StorageService.getMonthlyBudget();
      
      setExpenses(storedExpenses);
      setMonthlyBudget(storedMonthlyBudget);

      // Simulate loading time to show splash screen
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      // Set up notification response handling
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        if (data.type === 'budget_alert' || data.type === 'budget_warning') {
          // Navigate to budget screen when notification is tapped
          // Note: This will be handled by the navigation system
        }
      });

      return () => {
        subscription.remove();
      };
    };
    initialize();
  }, []);

  const handleAddExpense = async (expense: { item: string; amount: number; category: string; date?: Date }) => {
    try {
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        date: expense.date || new Date(),
      };

      await StorageService.saveExpense(newExpense);
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);

      // Check daily budget
      const dailyBudget = monthlyBudget / 30; // Approximate daily budget
      const today = new Date();
      const todayExpenses = updatedExpenses
        .filter(exp => exp.date.toDateString() === today.toDateString())
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      await NotificationService.scheduleBudgetAlert(todayExpenses, dailyBudget, 'daily');

      // Check weekly budget
      const weeklyBudget = monthlyBudget / 4;
      const weeklyExpenses = updatedExpenses
        .filter(exp => {
          const diffTime = Math.abs(today.getTime() - exp.date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      await NotificationService.scheduleBudgetAlert(weeklyExpenses, weeklyBudget, 'weekly');
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleSetMonthlyBudget = async (amount: number) => {
    await StorageService.setMonthlyBudget(amount);
    setMonthlyBudget(amount);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await StorageService.deleteExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <BackgroundLayout>
          <LoadingScreen />
        </BackgroundLayout>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <BackgroundLayout>
        <NavigationContainer theme={customDarkTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;
                if (route.name === 'My Expense') {
                  iconName = focused ? 'list' : 'list-outline';
                } else {
                  iconName = focused ? 'wallet' : 'wallet-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#4ecdc4',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                backgroundColor: '#2a2a2a',
                borderTopColor: '#333333',
              },
              headerStyle: {
                backgroundColor: '#2a2a2a',
                height: 60,
              },
              headerTitleStyle: {
                color: '#ffffff',
                marginLeft: 16,
              },
              headerRight: () => <AnimatedLogo />,
              headerRightContainerStyle: {
                position: 'relative',
                right: 0,
                height: '100%',
              }
            })}
          >
            <Tab.Screen 
              name="My Expense" 
              children={() => (
                <MainScreen 
                  expenses={expenses} 
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}
            />
            <Tab.Screen 
              name="My Budget" 
              children={() => (
                <BudgetScreen 
                  expenses={expenses}
                  monthlyBudget={monthlyBudget}
                  weeklyBudget={monthlyBudget / 4}
                  onSetBudget={handleSetMonthlyBudget}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </BackgroundLayout>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingLogo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 10,
    textShadowColor: 'rgba(78, 205, 196, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loadingSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.8,
  },
});
