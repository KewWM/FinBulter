import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing, Text } from 'react-native';

export const AnimatedLogo = () => {
  const coinAnim = useRef(new Animated.Value(0)).current;
  const coinOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      // Reset animations
      coinAnim.setValue(0);
      coinOpacity.setValue(0);
      logoScale.setValue(1);

      Animated.sequence([
        // Scale up the money packet
        Animated.timing(logoScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(2)),
        }),
        // Start coin animation
        Animated.parallel([
          // Move coin upward
          Animated.timing(coinAnim, {
            toValue: -20,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          // Fade in coin
          Animated.timing(coinOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          // Scale down packet
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        // Fade out coin
        Animated.timing(coinOpacity, {
          toValue: 0,
          duration: 300,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat animation after delay
        setTimeout(animate, 3000);
      });
    };

    animate();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require('../../assets/moneydark.png')}
          style={[
            styles.logo,
            {
              transform: [{ scale: logoScale }],
            },
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.coin,
          {
            opacity: coinOpacity,
            transform: [
              { translateY: coinAnim },
              {
                scale: coinOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.coinText}>💰</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
  },
  logoContainer: {
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  coin: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  coinText: {
    fontSize: 14,
  },
});