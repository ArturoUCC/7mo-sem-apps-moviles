import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceRoller() {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    rotate.setValue(0);

    Animated.parallel([
      Animated.timing(rotate, { toValue: 4, duration: 700, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 350, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
    ]).start(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setValue(result);
      setRolling(false);
    });
  };

  const spin = rotate.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '1440deg'] });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lanzar Dados</Text>

      <Animated.View style={[styles.diceBox, { transform: [{ rotate: spin }, { scale }] }]}>
        <Text style={styles.diceFace}>{FACES[value - 1]}</Text>
      </Animated.View>

      <Text style={styles.result}>Resultado: {value}</Text>

      <TouchableOpacity style={styles.button} onPress={roll} disabled={rolling}>
        <Text style={styles.buttonText}>{rolling ? 'Lanzando...' : 'Lanzar dado'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 30 },
  diceBox: {
    width: 140,
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  diceFace: { fontSize: 90 },
  result: { fontSize: 18, color: '#374151', marginTop: 24, marginBottom: 10 },
  button: { marginTop: 10, backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 34, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});