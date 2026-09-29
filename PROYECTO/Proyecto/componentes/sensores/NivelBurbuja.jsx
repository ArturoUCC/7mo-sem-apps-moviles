import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Accelerometer } from "expo-sensors";

const NIVEL_SIZE = 240;
const BURBUJA_SIZE = 46;
const RADIO_MAX = (NIVEL_SIZE - BURBUJA_SIZE) / 2;
const TOLERANCIA_NIVELADO = 12; // px de distancia al centro para considerarse "nivelado"

export default function NivelBurbuja() {
  const [inclinacionX, setInclinacionX] = useState(0);
  const [inclinacionY, setInclinacionY] = useState(0);
  const [nivelado, setNivelado] = useState(false);

  const burbujaAnimada = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    const subscribir = Accelerometer.addListener(({ x, y }) => {
      // Escalamos la inclinación para que se note el movimiento
      const ESCALA = 220;

      let posX = x * ESCALA;
      let posY = y * ESCALA;

      // Que no se salga del círculo exterior
      const distancia = Math.hypot(posX, posY);
      if (distancia > RADIO_MAX) {
        const factor = RADIO_MAX / distancia;
        posX *= factor;
        posY *= factor;
      }

      burbujaAnimada.setValue({ x: posX, y: -posY });
      setInclinacionX(x);
      setInclinacionY(y);
      setNivelado(distancia < TOLERANCIA_NIVELADO);
    });

    Accelerometer.setUpdateInterval(50);

    return () => subscribir.remove();
  }, []);

  // Grados aproximados de inclinación en cada eje
  const gradosX = (inclinacionX * 90).toFixed(1);
  const gradosY = (inclinacionY * 90).toFixed(1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nivel de burbuja</Text>
      <Text style={styles.hint}>Coloca el celular plano sobre una superficie</Text>

      <View style={[styles.nivelExterior, nivelado && styles.nivelExteriorOk]}>
        {/* Anillo objetivo (centro) */}
        <View style={styles.aroCentro} />

        {/* Líneas guía */}
        <View style={styles.lineaHorizontal} />
        <View style={styles.lineaVertical} />

        {/* La burbuja */}
        <Animated.View
          style={[
            styles.burbuja,
            nivelado && styles.burbujaOk,
            { transform: [{ translateX: burbujaAnimada.x }, { translateY: burbujaAnimada.y }] },
          ]}
        />
      </View>

      <Text style={[styles.estado, nivelado && styles.estadoOk]}>
        {nivelado ? '✓ Nivelado' : 'Ajusta la inclinación'}
      </Text>

      <View style={styles.datos}>
        <View style={styles.card}>
          <Text style={styles.axis}>Eje X</Text>
          <Text style={styles.value}>{gradosX}°</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.axis}>Eje Y</Text>
          <Text style={styles.value}>{gradosY}°</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', paddingTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  hint: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  nivelExterior: {
    width: NIVEL_SIZE,
    height: NIVEL_SIZE,
    borderRadius: NIVEL_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nivelExteriorOk: {
    borderColor: '#10b981',
  },
  aroCentro: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  lineaHorizontal: {
    position: 'absolute',
    width: NIVEL_SIZE - 20,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  lineaVertical: {
    position: 'absolute',
    width: 1,
    height: NIVEL_SIZE - 20,
    backgroundColor: '#e5e7eb',
  },
  burbuja: {
    position: 'absolute',
    width: BURBUJA_SIZE,
    height: BURBUJA_SIZE,
    borderRadius: BURBUJA_SIZE / 2,
    backgroundColor: 'rgba(99, 102, 241, 0.35)',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  burbujaOk: {
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    borderColor: '#10b981',
  },
  estado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 20,
  },
  estadoOk: {
    color: '#10b981',
  },
  datos: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  axis: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 2 },
});