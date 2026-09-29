import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Accelerometer } from "expo-sensors";

const { width } = Dimensions.get('window');
const UMBRAL_SHAKE = 1.8;
const DURACION_JUEGO = 30; // segundos
const COLORES_BURBUJA = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

function generarBurbuja(id) {
  const size = 40 + Math.random() * 40;
  return {
    id,
    size,
    x: Math.random() * (width - size - 40) + 20,
    y: Math.random() * 400 + 20,
    color: COLORES_BURBUJA[Math.floor(Math.random() * COLORES_BURBUJA.length)],
    escala: new Animated.Value(1),
  };
}

let siguienteId = 0;

export default function RomperBurbujas() {
  const [burbujas, setBurbujas] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [mejorPuntaje, setMejorPuntaje] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(DURACION_JUEGO);
  const [estado, setEstado] = useState('esperando'); // esperando | jugando | terminado

  const estadoRef = useRef(estado);
  const ultimoShake = useRef(0);

  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  // Sensor de agitada
  useEffect(() => {
    const subscribir = Accelerometer.addListener(({ x, y, z }) => {
      if (estadoRef.current !== 'jugando') return;

      const magnitud = Math.sqrt(x * x + y * y + z * z);
      const ahora = Date.now();

      if (magnitud > UMBRAL_SHAKE && ahora - ultimoShake.current > 400) {
        ultimoShake.current = ahora;
        reventarAlgunas();
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscribir.remove();
  }, []);

  // Cuenta regresiva
  useEffect(() => {
    if (estado !== 'jugando') return;

    const interval = setInterval(() => {
      setTiempoRestante((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setEstado('terminado');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [estado]);

  // Al terminar, actualiza mejor puntaje
  useEffect(() => {
    if (estado === 'terminado') {
      setMejorPuntaje((m) => Math.max(m, puntos));
    }
  }, [estado]);

  const iniciarJuego = () => {
    setBurbujas(Array.from({ length: 8 }, () => generarBurbuja(siguienteId++)));
    setPuntos(0);
    setTiempoRestante(DURACION_JUEGO);
    setEstado('jugando');
  };

  const reventarAlgunas = () => {
    setBurbujas((actuales) => {
      if (actuales.length === 0) return actuales;

      const cantidad = Math.min(actuales.length, 1 + Math.floor(Math.random() * 3));
      const indicesAReventar = new Set();
      while (indicesAReventar.size < cantidad) {
        indicesAReventar.add(Math.floor(Math.random() * actuales.length));
      }

      const idsAReventar = [...indicesAReventar].map((i) => actuales[i].id);

      idsAReventar.forEach((id) => {
        const burbuja = actuales.find((b) => b.id === id);
        Animated.timing(burbuja.escala, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });

      setPuntos((p) => p + idsAReventar.length);

      setTimeout(() => {
        setBurbujas((prev) => {
          if (estadoRef.current !== 'jugando') return prev;
          const restantes = prev.filter((b) => !idsAReventar.includes(b.id));
          const nuevas = idsAReventar.map(() => generarBurbuja(siguienteId++));
          return [...restantes, ...nuevas];
        });
      }, 250);

      return actuales;
    });
  };

  const reventarManual = (id) => {
    if (estadoRef.current !== 'jugando') return;

    setBurbujas((actuales) => {
      const burbuja = actuales.find((b) => b.id === id);
      if (!burbuja) return actuales;

      Animated.timing(burbuja.escala, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setBurbujas((prev) => {
          if (estadoRef.current !== 'jugando') return prev;
          const restantes = prev.filter((b) => b.id !== id);
          return [...restantes, generarBurbuja(siguienteId++)];
        });
      });

      setPuntos((p) => p + 1);
      return actuales;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Romper burbujas</Text>

      {estado === 'esperando' && (
        <View style={styles.centro}>
          <Text style={styles.hint}>Tienes {DURACION_JUEGO} segundos.</Text>
          <Text style={styles.hint}>Agita el celular o toca las burbujas.</Text>
          {mejorPuntaje > 0 && <Text style={styles.mejor}>Mejor puntaje: {mejorPuntaje}</Text>}
          <TouchableOpacity style={styles.button} onPress={iniciarJuego}>
            <Text style={styles.buttonText}>Empezar</Text>
          </TouchableOpacity>
        </View>
      )}

      {estado === 'jugando' && (
        <>
          <View style={styles.marcador}>
            <Text style={styles.marcadorTexto}>Puntos: {puntos}</Text>
            <Text style={[styles.marcadorTexto, tiempoRestante <= 5 && styles.tiempoUrgente]}>
              ⏱ {tiempoRestante}s
            </Text>
          </View>

          <View style={styles.area}>
            {burbujas.map((b) => (
              <Animated.View
                key={b.id}
                style={[
                  styles.burbuja,
                  {
                    left: b.x,
                    top: b.y,
                    width: b.size,
                    height: b.size,
                    borderRadius: b.size / 2,
                    backgroundColor: b.color,
                    transform: [{ scale: b.escala }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={StyleSheet.absoluteFill}
                  onPress={() => reventarManual(b.id)}
                  activeOpacity={0.7}
                />
              </Animated.View>
            ))}
          </View>
        </>
      )}

      {estado === 'terminado' && (
        <View style={styles.centro}>
          <Text style={styles.finTitulo}>⏰ ¡Tiempo!</Text>
          <Text style={styles.finPuntaje}>{puntos} burbujas</Text>
          {puntos === mejorPuntaje && puntos > 0 && (
            <Text style={styles.record}>🏆 ¡Nuevo mejor puntaje!</Text>
          )}
          <Text style={styles.mejor}>Mejor puntaje: {mejorPuntaje}</Text>
          <TouchableOpacity style={styles.button} onPress={iniciarJuego}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', paddingTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  mejor: { fontSize: 15, color: '#6366f1', fontWeight: '600', marginTop: 16, marginBottom: 20 },
  marcador: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginBottom: 10,
  },
  marcadorTexto: { fontSize: 17, fontWeight: '700', color: '#6366f1' },
  tiempoUrgente: { color: '#ef4444' },
  area: {
    width: '100%',
    height: 460,
    position: 'relative',
  },
  burbuja: {
    position: 'absolute',
    opacity: 0.85,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  finTitulo: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  finPuntaje: { fontSize: 42, fontWeight: 'bold', color: '#6366f1' },
  record: { fontSize: 15, color: '#f59e0b', fontWeight: '700', marginTop: 10 },
  button: {
    marginTop: 10,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});