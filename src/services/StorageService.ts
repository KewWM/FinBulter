import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  EXPENSES: '@finbulter_expenses',
  MONTHLY_BUDGET: '@finbulter_monthly_budget',
};

export type Expense = {
  id: string;
  item: string;
  amount: number;
  category: string;
  date: Date;
};

export class StorageService {
  static async saveExpense(expense: Expense): Promise<void> {
    try {
      if (!expense || typeof expense !== 'object' || Array.isArray(expense)) {
        throw new Error('Invalid expense object');
      }

      // Validate all required fields exist and are of correct type
      if (!expense.item || typeof expense.item !== 'string' ||
          typeof expense.amount !== 'number' ||
          !expense.category || typeof expense.category !== 'string' ||
          !(expense.date instanceof Date)) {
        throw new Error('Invalid expense properties');
      }
      
      const expenses = await this.getExpenses();
      if (!Array.isArray(expenses)) {
        throw new Error('Existing expenses data is corrupted');
      }
      
      // Create a new validated expense object
      const validatedExpense: Expense = {
        id: String(expense.id || Date.now()),
        item: expense.item.trim(),
        amount: Number(expense.amount),
        category: expense.category.trim(),
        date: expense.date,
      };
      
      expenses.push(validatedExpense);
      const expensesJson = JSON.stringify(expenses.map(exp => ({
        ...exp,
        date: exp.date.toISOString(), // Convert Date to string for storage
      })));
      
      await AsyncStorage.setItem(KEYS.EXPENSES, expensesJson);
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  }

  static async getExpenses(): Promise<Expense[]> {
    try {
      const expensesJson = await AsyncStorage.getItem(KEYS.EXPENSES);
      if (!expensesJson) return [];
      
      const expenses = JSON.parse(expensesJson);
      if (!Array.isArray(expenses)) {
        console.warn('Stored expenses data is not an array, resetting to empty array');
        return [];
      }
      
      return expenses.map((expense: any) => ({
        id: String(expense.id || Date.now()),
        item: String(expense.item || ''),
        amount: Number(expense.amount) || 0,
        category: String(expense.category || ''),
        date: new Date(expense.date || Date.now()),
      }));
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  static async deleteExpense(id: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const filteredExpenses = expenses.filter(expense => expense.id !== id);
      const expensesJson = JSON.stringify(filteredExpenses.map(exp => ({
        ...exp,
        date: exp.date.toISOString(),
      })));
      
      await AsyncStorage.setItem(KEYS.EXPENSES, expensesJson);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  static async setMonthlyBudget(amount: number): Promise<void> {
    try {
      const validAmount = Number(amount) || 0;
      await AsyncStorage.setItem(KEYS.MONTHLY_BUDGET, validAmount.toString());
    } catch (error) {
      console.error('Error setting monthly budget:', error);
      throw error;
    }
  }

  static async getMonthlyBudget(): Promise<number> {
    try {
      const budget = await AsyncStorage.getItem(KEYS.MONTHLY_BUDGET);
      return budget ? parseFloat(budget) : 0;
    } catch (error) {
      console.error('Error getting monthly budget:', error);
      return 0;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.EXPENSES]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}
