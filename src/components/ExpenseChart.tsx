import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ExpenseChartProps = {
  expenses: Array<{
    date: Date;
    amount: number;
  }>;
  timeframe: 'weekly' | 'monthly';
};

export const ExpenseChart = ({ expenses, timeframe }: ExpenseChartProps) => {
  const insets = useSafeAreaInsets();

  const processData = () => {
    const sortedExpenses = [...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
    const labels: string[] = [];
    const data: number[] = [];

    if (timeframe === 'weekly') {
      // Group by days of the week
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        const dayTotal = sortedExpenses
          .filter(exp => exp.date.toDateString() === date.toDateString())
          .reduce((sum, exp) => sum + exp.amount, 0);
        data.push(dayTotal);
      }
    } else {
      // Group by weeks of the month
      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const numberOfWeeks = Math.ceil((currentDate.getDate()) / 7);

      for (let i = 0; i < numberOfWeeks; i++) {
        labels.push(`Week ${i + 1}`);
        const weekStart = new Date(firstDay);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekTotal = sortedExpenses
          .filter(exp => exp.date >= weekStart && exp.date <= weekEnd)
          .reduce((sum, exp) => sum + exp.amount, 0);
        data.push(weekTotal);
      }
    }

    return { labels, data };
  };

  const { labels, data } = processData();
  const chartWidth = Dimensions.get('window').width - 32 - (insets.left + insets.right);

  return (
    <View style={[
      styles.container,
      {
        marginHorizontal: Math.max(16 + insets.left, 16 + insets.right),
        marginBottom: Math.max(16, insets.bottom)
      }
    ]}>
      <Text style={styles.title}>Expense Trend</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels,
            datasets: [{
              data: data.length ? data : [0],
            }],
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'rgba(26, 26, 26, 0.5)',
            backgroundGradientTo: 'rgba(26, 26, 26, 0.7)',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#4ecdc4"
            },
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: "rgba(255, 255, 255, 0.1)",
            },
          }}
          style={styles.chart}
          bezier
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(42, 42, 42, 0.85)',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});