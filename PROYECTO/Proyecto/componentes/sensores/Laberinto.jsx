import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Accelerometer } from "expo-sensors";

// Mapa del laberinto: 9 filas x 8 columnas.
// '#' = pared, '.' = camino, 'S' = inicio, 'G' = meta
const MAPA = [
  '........',
  '#######.',
  '........',
  '.#######',
  '........',
  '#######.',
  '........',
  '.#######',
  '........',
];

const CELL = 36;
const BALL_RADIUS = 11;
const COLS = MAPA[0].length;
const ROWS = MAPA.length;
const ANCHO = COLS * CELL;
const ALTO = ROWS * CELL;

// Construye la lista de rectángulos de pared a partir del mapa
function construirParedes() {
  const paredes = [];
  MAPA.forEach((fila, r) => {
    [...fila].forEach((celda, c) => {
      if (celda === '#') {
        paredes.push({ x: c * CELL, y: r * CELL, w: CELL, h: CELL });
      }
    });
  });
  return paredes;
}

const PAREDES = construirParedes();
const INICIO = { x: CELL / 2, y: CELL / 2 };
const META = { x: (COLS - 0.5) * CELL, y: (ROWS - 0.5) * CELL };

// Colisión círculo (bola) vs rectángulo (pared), con resolución simple
function resolverColision(pos, vel, radio, pared) {
  const cercaX = Math.max(pared.x, Math.min(pos.x, pared.x + pared.w));
  const cercaY = Math.max(pared.y, Math.min(pos.y, pared.y + pared.h));
  const dx = pos.x - cercaX;
  const dy = pos.y - cercaY;
  const distSq = dx * dx + dy * dy;

  if (distSq < radio * radio) {
    const dist = Math.sqrt(distSq) || 0.01;
    const overlap = radio - dist;
    pos.x += (dx / dist) * overlap;
    pos.y += (dy / dist) * overlap;

    // Anula la velocidad en la dirección del choque
    const nx = dx / dist;
    const ny = dy / dist;
    const dot = vel.x * nx + vel.y * ny;
    vel.x -= dot * nx;
    vel.y -= dot * ny;
  }
}

export default function Laberinto() {
  const posicion = useRef({ ...INICIO });
  const velocidad = useRef({ x: 0, y: 0 });
  const bolaAnimada = useRef(new Animated.ValueXY(INICIO)).current;

  const [gano, setGano] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const jugando = useRef(true);
  const inicioTiempo = useRef(Date.now());

  useEffect(() => {
    const subscribir = Accelerometer.addListener(({ x, y }) => {
      if (!jugando.current) return;

      const GRAVEDAD = 900;
      const FRICCION = 0.92;
      const DT = 0.032;

      // Inclinar a la derecha (x negativo en el sensor) mueve la bola a la derecha
      velocidad.current.x += x * GRAVEDAD * DT;
      velocidad.current.y += -y * GRAVEDAD * DT;

      velocidad.current.x *= FRICCION;
      velocidad.current.y *= FRICCION;

      const nuevaPos = {
        x: posicion.current.x + velocidad.current.x * DT,
        y: posicion.current.y + velocidad.current.y * DT,
      };

      // Límites del laberinto
      nuevaPos.x = Math.max(BALL_RADIUS, Math.min(ANCHO - BALL_RADIUS, nuevaPos.x));
      nuevaPos.y = Math.max(BALL_RADIUS, Math.min(ALTO - BALL_RADIUS, nuevaPos.y));

      // Colisión contra cada pared
      PAREDES.forEach((pared) => {
        resolverColision(nuevaPos, velocidad.current, BALL_RADIUS, pared);
      });

      posicion.current = nuevaPos;
      bolaAnimada.setValue(nuevaPos);

      // ¿Llegó a la meta?
      const distMeta = Math.hypot(nuevaPos.x - META.x, nuevaPos.y - META.y);
      if (distMeta < CELL / 2) {
        jugando.current = false;
        setGano(true);
      }
    });

    Accelerometer.setUpdateInterval(32);

    return () => subscribir.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (jugando.current) {
        setTiempo(Date.now() - inicioTiempo.current);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const reiniciar = () => {
    posicion.current = { ...INICIO };
    velocidad.current = { x: 0, y: 0 };
    bolaAnimada.setValue(INICIO);
    inicioTiempo.current = Date.now();
    setTiempo(0);
    setGano(false);
    jugando.current = true;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Laberinto</Text>
      <Text style={styles.hint}>Inclina el celular para mover la bolita</Text>
      <Text style={styles.timer}>{(tiempo / 1000).toFixed(1)}s</Text>

      <View style={[styles.maze, { width: ANCHO, height: ALTO }]}>
        {PAREDES.map((p, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
              backgroundColor: '#374151',
            }}
          />
        ))}

        {/* Meta */}
        <View
          style={{
            position: 'absolute',
            left: META.x - CELL / 2 + 4,
            top: META.y - CELL / 2 + 4,
            width: CELL - 8,
            height: CELL - 8,
            borderRadius: 6,
            backgroundColor: '#10b981',
          }}
        />

        {/* Bola */}
        <Animated.View
          style={[
            styles.ball,
            {
              transform: [
                { translateX: Animated.subtract(bolaAnimada.x, BALL_RADIUS) },
                { translateY: Animated.subtract(bolaAnimada.y, BALL_RADIUS) },
              ],
            },
          ]}
        />
      </View>

      {gano && (
        <View style={styles.overlay}>
          <Text style={styles.ganoTexto}>🎉 ¡Meta alcanzada! 🎉</Text>
          <Text style={styles.ganoTiempo}>Tiempo: {(tiempo / 1000).toFixed(1)}s</Text>
          <TouchableOpacity style={styles.button} onPress={reiniciar}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', paddingTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  hint: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 6 },
  timer: { fontSize: 18, fontWeight: '600', color: '#6366f1', marginBottom: 10 },
  maze: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#374151',
  },
  ball: {
    position: 'absolute',
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  overlay: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ganoTexto: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  ganoTiempo: { fontSize: 14, color: '#6b7280', marginTop: 6, marginBottom: 14 },
  button: { backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});