import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Magnetometer } from "expo-sensors";

// Convierte los datos crudos del magnetómetro en un ángulo (0-360°)
function calcularAngulo(magnetometro) {
  let angulo = 0;
  if (magnetometro) {
    const { x, y } = magnetometro;
    if (Math.atan2(y, x) >= 0) {
      angulo = Math.atan2(y, x) * (180 / Math.PI);
    } else {
      angulo = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
    }
  }
  return Math.round(angulo);
}

// Convierte el ángulo en dirección cardinal
function direccionCardinal(grados) {
  const direcciones = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(grados / 45) % 8;
  return direcciones[index];
}

export default function MagnetometerSensor() {
  const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
  const [grados, setGrados] = useState(0);

  // Ángulo animado para que la brújula gire suave, sin saltos
  const anguloAnimado = useRef(new Animated.Value(0)).current;
  const ultimoAngulo = useRef(0);

  useEffect(() => {
    const subscribir = Magnetometer.addListener((measurements) => {
      setDatos(measurements);

      const nuevoAngulo = calcularAngulo(measurements);
      setGrados(nuevoAngulo);

      // Evita que gire "al revés" cuando cruza 0°/360°
      let diferencia = nuevoAngulo - (ultimoAngulo.current % 360);
      if (diferencia > 180) diferencia -= 360;
      if (diferencia < -180) diferencia += 360;

      const destino = ultimoAngulo.current + diferencia;
      ultimoAngulo.current = destino;

      Animated.timing(anguloAnimado, {
        toValue: destino,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    Magnetometer.setUpdateInterval(150);

    return () => {
      subscribir.remove();
    };
  }, []);

  // Rotamos el dial al revés del ángulo, así "N" siempre apunta al norte real
  const rotacionDial = anguloAnimado.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ['360deg', '0deg', '-360deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brújula</Text>

      <View style={styles.compassWrap}>
        <Animated.View style={[styles.dial, { transform: [{ rotate: rotacionDial }] }]}>
          <Text style={[styles.cardinal, styles.north]}>N</Text>
          <Text style={[styles.cardinal, styles.east]}>E</Text>
          <Text style={[styles.cardinal, styles.south]}>S</Text>
          <Text style={[styles.cardinal, styles.west]}>O</Text>

          {/* Marcas cada 30 grados */}
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.tick,
                { transform: [{ rotate: `${i * 30}deg` }] },
              ]}
            />
          ))}
        </Animated.View>

        {/* Aguja fija, siempre apuntando hacia arriba (norte real) */}
        <View style={styles.needle}>
          <View style={styles.needleNorth} />
          <View style={styles.needleSouth} />
        </View>

        <View style={styles.centerDot} />
      </View>

      <Text style={styles.degrees}>{grados}°</Text>
      <Text style={styles.direction}>{direccionCardinal(grados)}</Text>

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
  );
}

const DIAL_SIZE = 240;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 25,
    backgroundColor: "#efefef",
  },
  title: {
    fontSize: 30,
    marginTop: 10,
    marginBottom: 20,
    color: "#3a4a5a",
    fontWeight: 'bold',
  },
  compassWrap: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardinal: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  north: { top: 12, color: '#ef4444' },
  south: { bottom: 12 },
  east: { right: 14 },
  west: { left: 14 },
  tick: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: '#d1d5db',
    top: 6,
  },
  needle: {
    position: 'absolute',
    width: 6,
    height: DIAL_SIZE - 40,
    alignItems: 'center',
  },
  needleNorth: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: (DIAL_SIZE - 40) / 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ef4444',
  },
  needleSouth: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: (DIAL_SIZE - 40) / 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#9ca3af',
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  degrees: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3a4a5a',
  },
  direction: {
    fontSize: 20,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 10,
    width: '100%',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axis: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});