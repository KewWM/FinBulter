import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

type BackgroundLayoutProps = {
  children: React.ReactNode;
};

export const BackgroundLayout = ({ children }: BackgroundLayoutProps) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Image 
        source={require('../../assets/FinBulter.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.contentContainer}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});