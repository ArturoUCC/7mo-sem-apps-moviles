import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Gyroscope } from "expo-sensors";

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 60;

export default function GyroscopeSensor() {
  const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });

  // Posición de la pelota (animada, centro de la pantalla al inicio)
  const posX = useRef(new Animated.Value(width / 2 - BALL_SIZE / 2)).current;
  const posY = useRef(new Animated.Value(height / 2 - BALL_SIZE / 2)).current;

  // Guardamos la posición actual en refs para poder calcular la siguiente
  const currentX = useRef(width / 2 - BALL_SIZE / 2);
  const currentY = useRef(height / 2 - BALL_SIZE / 2);

  useEffect(() => {
    let subscribir;

    Gyroscope.isAvailableAsync().then((disponible) => {
      if (!disponible) return;

      Gyroscope.setUpdateInterval(16); // ~60fps para que la pelota fluya

      subscribir = Gyroscope.addListener((measurements) => {
        const { x, y } = measurements;
        setDatos(measurements);

        // x = giro en el eje horizontal, y = giro en el eje vertical
        const sensibilidad = 12;
        let nuevaX = currentX.current + y * sensibilidad;
        let nuevaY = currentY.current + x * sensibilidad;

        // Que no se salga de la pantalla
        nuevaX = Math.max(0, Math.min(width - BALL_SIZE, nuevaX));
        nuevaY = Math.max(0, Math.min(height - BALL_SIZE, nuevaY));

        currentX.current = nuevaX;
        currentY.current = nuevaY;

        posX.setValue(nuevaX);
        posY.setValue(nuevaY);
      });
    });

    return () => {
      subscribir && subscribir.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* La pelota */}
      <Animated.View
        style={[
          styles.ball,
          { transform: [{ translateX: posX }, { translateY: posY }] },
        ]}
      />

      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.title}>Giroscopio</Text>
        <Text style={styles.hint}>Gira el celular para mover la pelota 🌀</Text>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efefef",
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#6366f1',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    fontSize: 35,
    textAlign: 'center',
    marginBottom: 6,
    color: "#3a4a5a",
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axis: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});