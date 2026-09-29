import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const COLORES = [
  { id: 0, nombre: 'rojo', color: '#ef4444', colorActivo: '#fca5a5' },
  { id: 1, nombre: 'azul', color: '#3b82f6', colorActivo: '#93c5fd' },
  { id: 2, nombre: 'verde', color: '#10b981', colorActivo: '#6ee7b7' },
  { id: 3, nombre: 'amarillo', color: '#f59e0b', colorActivo: '#fcd34d' },
];

// Velocidad de la secuencia: empieza lenta y baja conforme creces (mínimo 300ms)
function calcularVelocidad(longitud) {
  return Math.max(300, 900 - longitud * 40);
}

export default function SimonDice() {
  const [secuencia, setSecuencia] = useState([]);
  const [pasoJugador, setPasoJugador] = useState(0);
  const [estado, setEstado] = useState('esperando'); // esperando | mostrando | turnoJugador | perdio
  const [mejorRacha, setMejorRacha] = useState(0);
  const [activo, setActivo] = useState(null);

  const opacidades = useRef(COLORES.map(() => new Animated.Value(1))).current;

  const iluminar = (id, duracion) => {
    return new Promise((resolve) => {
      setActivo(id);
      Animated.sequence([
        Animated.timing(opacidades[id], { toValue: 0.35, duration: 100, useNativeDriver: true }),
        Animated.timing(opacidades[id], { toValue: 1, duration: duracion - 100, useNativeDriver: true }),
      ]).start(() => {
        setActivo(null);
        resolve();
      });
    });
  };

  const mostrarSecuencia = async (secuenciaActual) => {
    setEstado('mostrando');
    const velocidad = calcularVelocidad(secuenciaActual.length);

    for (const id of secuenciaActual) {
      await iluminar(id, velocidad);
      await new Promise((r) => setTimeout(r, velocidad * 0.25));
    }

    setPasoJugador(0);
    setEstado('turnoJugador');
  };

  const iniciarJuego = () => {
    const primerColor = Math.floor(Math.random() * 4);
    const nuevaSecuencia = [primerColor];
    setSecuencia(nuevaSecuencia);
    mostrarSecuencia(nuevaSecuencia);
  };

  const agregarColor = () => {
    const nuevoColor = Math.floor(Math.random() * 4);
    const nuevaSecuencia = [...secuencia, nuevoColor];
    setSecuencia(nuevaSecuencia);
    mostrarSecuencia(nuevaSecuencia);
  };

  const tocarColor = async (id) => {
    if (estado !== 'turnoJugador') return;

    await iluminar(id, 250);

    if (secuencia[pasoJugador] !== id) {
      setMejorRacha((m) => Math.max(m, secuencia.length - 1));
      setEstado('perdio');
      return;
    }

    const siguientePaso = pasoJugador + 1;

    if (siguientePaso === secuencia.length) {
      // Completó la ronda, agrega un color y muestra de nuevo
      setEstado('mostrando');
      setTimeout(() => agregarColor(), 500);
    } else {
      setPasoJugador(siguientePaso);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simon dice</Text>

      {estado === 'esperando' && (
        <View style={styles.centro}>
          <Text style={styles.hint}>Repite la secuencia de colores.</Text>
          <Text style={styles.hint}>Se vuelve más rápido conforme avanzas.</Text>
          {mejorRacha > 0 && <Text style={styles.mejor}>Mejor racha: {mejorRacha}</Text>}
          <TouchableOpacity style={styles.button} onPress={iniciarJuego}>
            <Text style={styles.buttonText}>Empezar</Text>
          </TouchableOpacity>
        </View>
      )}

      {(estado === 'mostrando' || estado === 'turnoJugador') && (
        <>
          <Text style={styles.nivel}>Nivel {secuencia.length}</Text>
          <Text style={styles.estadoTexto}>
            {estado === 'mostrando' ? 'Observa...' : 'Tu turno'}
          </Text>
        </>
      )}

      {(estado === 'mostrando' || estado === 'turnoJugador' || estado === 'perdio') && (
        <View style={styles.tablero}>
          {COLORES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.botonWrap}
              onPress={() => tocarColor(c.id)}
              disabled={estado !== 'turnoJugador'}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.boton,
                  {
                    backgroundColor: activo === c.id ? c.colorActivo : c.color,
                    opacity: opacidades[c.id],
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {estado === 'perdio' && (
        <View style={styles.centro}>
          <Text style={styles.perdioTexto}>❌ ¡Fallaste!</Text>
          <Text style={styles.perdioRacha}>Llegaste al nivel {secuencia.length}</Text>
          <Text style={styles.mejor}>Mejor racha: {mejorRacha}</Text>
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
  nivel: { fontSize: 16, color: '#6b7280', marginBottom: 2 },
  estadoTexto: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginBottom: 20 },
  tablero: {
    width: 260,
    height: 260,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 20,
    overflow: 'hidden',
    gap: 6,
  },
  botonWrap: {
    width: '48%',
    height: '48%',
  },
  boton: {
    flex: 1,
    borderRadius: 14,
  },
  perdioTexto: { fontSize: 26, fontWeight: 'bold', color: '#ef4444', marginBottom: 6 },
  perdioRacha: { fontSize: 16, color: '#374151', marginBottom: 4 },
  button: {
    marginTop: 10,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});