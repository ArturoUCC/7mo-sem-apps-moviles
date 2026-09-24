import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

function getCategory(imc) {
  if (imc < 18.5) return { label: 'Bajo peso', color: '#3b82f6' };
  if (imc < 25) return { label: 'Peso normal', color: '#10b981' };
  if (imc < 30) return { label: 'Sobrepeso', color: '#f59e0b' };
  return { label: 'Obesidad', color: '#ef4444' };
}

export default function IMCCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [imc, setImc] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const result = w / (h * h);
    setImc(result);
  };

  const category = imc ? getCategory(imc) : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Calculadora de IMC</Text>

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholder="Ej. 70"
        />

        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          placeholder="Ej. 170"
        />

        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>Calcular</Text>
        </TouchableOpacity>

        {imc && (
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>{imc.toFixed(1)}</Text>
            <Text style={[styles.resultLabel, { color: category.color }]}>{category.label}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f9fafb', padding: 24, alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  label: { alignSelf: 'flex-start', fontSize: 14, color: '#6b7280', marginBottom: 4, marginTop: 12 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: { marginTop: 24, backgroundColor: '#f59e0b', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  resultBox: { marginTop: 30, alignItems: 'center' },
  resultValue: { fontSize: 48, fontWeight: 'bold', color: '#111827' },
  resultLabel: { fontSize: 18, fontWeight: '600', marginTop: 6 },
});