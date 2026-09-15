import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { Accelerometer } from "expo-sensors";

// Paleta de colores para el fondo
const COLORES = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

// Qué tan fuerte hay que agitar para que cuente
const UMBRAL_SHAKE = 1.8;

export default function AccelerometerSensor() {
  const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
  const [colorFondo, setColorFondo] = useState('#efefef');
  const [shakes, setShakes] = useState(0);

  // Para no disparar mil shakes seguidos
  const ultimoShake = useRef(0);

  useEffect(() => {
    let subscripcion;

    Accelerometer.isAvailableAsync().then((disponible) => {
      if (!disponible) return;

      Accelerometer.setUpdateInterval(100);

      subscripcion = Accelerometer.addListener((measurements) => {
        const { x, y, z } = measurements;
        setDatos(measurements);

        // Magnitud total de la aceleración. En reposo ≈ 1 (por la gravedad).
        const magnitud = Math.sqrt(x * x + y * y + z * z);
        const ahora = Date.now();

        if (magnitud > UMBRAL_SHAKE && ahora - ultimoShake.current > 600) {
          ultimoShake.current = ahora;
          setShakes((s) => s + 1);

          // Color distinto al actual
          setColorFondo((prev) => {
            let nuevo = prev;
            while (nuevo === prev) {
              nuevo = COLORES[Math.floor(Math.random() * COLORES.length)];
            }
            return nuevo;
          });
        }
      });
    });

    return () => {
      subscripcion && subscripcion.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colorFondo }]}>
      <Text style={styles.title}>Acelerómetro</Text>
      <Text style={styles.hint}>Agita el celular para cambiar el color 🎨</Text>

      <View style={styles.card}>
        <Text style={styles.axis}>x</Text>
        <Text style={styles.value}>{datos.x.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.axis}>y</Text>
        <Text style={styles.value}>{datos.y.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.axis}>z</Text>
        <Text style={styles.value}>{datos.z.toFixed(2)}</Text>
      </View>

      <Text style={styles.shakes}>Agitadas: {shakes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    fontSize: 35,
    textAlign: 'center',
    marginBottom: 6,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 25,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 16,
    marginBottom: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axis: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a4a5a',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a4a5a',
  },
  shakes: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});