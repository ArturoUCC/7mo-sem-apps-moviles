import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const DIFICULTADES = {
  facil: { nombre: 'Fácil', filas: 8, cols: 8, minas: 10 },
  medio: { nombre: 'Medio', filas: 10, cols: 8, minas: 16 },
  dificil: { nombre: 'Difícil', filas: 12, cols: 8, minas: 24 },
};

const CELL = 38;

function crearTableroVacio(filas, cols) {
  return Array.from({ length: filas }, () =>
    Array.from({ length: cols }, () => ({
      mina: false,
      revelada: false,
      bandera: false,
      numero: 0,
    }))
  );
}

function colocarMinas(tablero, filas, cols, cantidadMinas, filaSegura, colSegura) {
  let colocadas = 0;
  while (colocadas < cantidadMinas) {
    const f = Math.floor(Math.random() * filas);
    const c = Math.floor(Math.random() * cols);

    const cercaDeSegura = Math.abs(f - filaSegura) <= 1 && Math.abs(c - colSegura) <= 1;
    if (tablero[f][c].mina || cercaDeSegura) continue;

    tablero[f][c].mina = true;
    colocadas++;
  }

  // Calcula números de celdas adyacentes a minas
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      if (tablero[f][c].mina) continue;
      let contador = 0;
      for (let df = -1; df <= 1; df++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nf = f + df;
          const nc = c + dc;
          if (nf >= 0 && nf < filas && nc >= 0 && nc < cols && tablero[nf][nc].mina) {
            contador++;
          }
        }
      }
      tablero[f][c].numero = contador;
    }
  }

  return tablero;
}

const COLOR_NUMERO = {
  1: '#3b82f6', 2: '#10b981', 3: '#ef4444', 4: '#8b5cf6',
  5: '#f59e0b', 6: '#14b8a6', 7: '#374151', 8: '#6b7280',
};

export default function Buscaminas() {
  const [dificultad, setDificultad] = useState(null);
  const [tablero, setTablero] = useState(null);
  const [estado, setEstado] = useState('seleccion'); // seleccion | jugando | gano | perdio
  const [banderas, setBanderas] = useState(0);

  const tableroGenerado = useRef(false);

  const elegirDificultad = (clave) => {
    const config = DIFICULTADES[clave];
    setDificultad(config);
    setTablero(crearTableroVacio(config.filas, config.cols));
    tableroGenerado.current = false;
    setBanderas(0);
    setEstado('jugando');
  };

  const revelarVacias = (tab, f, c, filas, cols) => {
    if (f < 0 || f >= filas || c < 0 || c >= cols) return;
    const celda = tab[f][c];
    if (celda.revelada || celda.bandera) return;

    celda.revelada = true;

    if (celda.numero === 0) {
      for (let df = -1; df <= 1; df++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (df === 0 && dc === 0) continue;
          revelarVacias(tab, f + df, c + dc, filas, cols);
        }
      }
    }
  };

  const revisarVictoria = (tab, filas, cols, minas) => {
    let celdasReveladas = 0;
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < cols; c++) {
        if (tab[f][c].revelada) celdasReveladas++;
      }
    }
    return celdasReveladas === filas * cols - minas;
  };

  const tocarCelda = (f, c) => {
    if (estado !== 'jugando') return;

    setTablero((actual) => {
      let tab = actual.map((fila) => fila.map((celda) => ({ ...celda })));

      if (!tableroGenerado.current) {
        tab = colocarMinas(tab, dificultad.filas, dificultad.cols, dificultad.minas, f, c);
        tableroGenerado.current = true;
      }

      if (tab[f][c].bandera || tab[f][c].revelada) return tab;

      if (tab[f][c].mina) {
        for (let ff = 0; ff < dificultad.filas; ff++) {
          for (let cc = 0; cc < dificultad.cols; cc++) {
            if (tab[ff][cc].mina) tab[ff][cc].revelada = true;
          }
        }
        setEstado('perdio');
        return tab;
      }

      revelarVacias(tab, f, c, dificultad.filas, dificultad.cols);

      if (revisarVictoria(tab, dificultad.filas, dificultad.cols, dificultad.minas)) {
        setEstado('gano');
      }

      return tab;
    });
  };

  const alternarBandera = (f, c) => {
    if (estado !== 'jugando') return;

    setTablero((actual) => {
      const tab = actual.map((fila) => fila.map((celda) => ({ ...celda })));
      const celda = tab[f][c];
      if (celda.revelada) return tab;

      celda.bandera = !celda.bandera;
      setBanderas((b) => b + (celda.bandera ? 1 : -1));
      return tab;
    });
  };

  const reiniciar = () => {
    setEstado('seleccion');
    setDificultad(null);
    setTablero(null);
  };

  if (estado === 'seleccion') {
    return (
      <View style={styles.centro}>
        <Text style={styles.title}>Buscaminas</Text>
        <Text style={styles.hint}>Elige una dificultad</Text>
        {Object.entries(DIFICULTADES).map(([clave, config]) => (
          <TouchableOpacity
            key={clave}
            style={styles.botonDificultad}
            onPress={() => elegirDificultad(clave)}
          >
            <Text style={styles.botonDificultadTexto}>{config.nombre}</Text>
            <Text style={styles.botonDificultadSub}>
              {config.filas}x{config.cols} · {config.minas} minas
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.marcador}>
        <Text style={styles.marcadorTexto}>🚩 {banderas}/{dificultad.minas}</Text>
        <TouchableOpacity onPress={reiniciar}>
          <Text style={styles.marcadorTexto}>🔄 Cambiar</Text>
        </TouchableOpacity>
      </View>

      {estado === 'gano' && <Text style={styles.mensajeGano}>🎉 ¡Ganaste!</Text>}
      {estado === 'perdio' && <Text style={styles.mensajePerdio}>💥 ¡Perdiste!</Text>}

      <ScrollView>
        <View style={styles.tablero}>
          {tablero.map((fila, f) => (
            <View key={f} style={{ flexDirection: 'row' }}>
              {fila.map((celda, c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.celda,
                    celda.revelada && styles.celdaRevelada,
                    celda.revelada && celda.mina && styles.celdaMina,
                  ]}
                  onPress={() => tocarCelda(f, c)}
                  onLongPress={() => alternarBandera(f, c)}
                  activeOpacity={0.7}
                >
                  {celda.bandera && !celda.revelada && <Text style={styles.bandera}>🚩</Text>}
                  {celda.revelada && celda.mina && <Text style={styles.minaTexto}>💣</Text>}
                  {celda.revelada && !celda.mina && celda.numero > 0 && (
                    <Text style={[styles.numero, { color: COLOR_NUMERO[celda.numero] }]}>
                      {celda.numero}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {(estado === 'gano' || estado === 'perdio') && (
        <TouchableOpacity style={styles.button} onPress={() => elegirDificultad(Object.keys(DIFICULTADES).find(k => DIFICULTADES[k] === dificultad))}>
          <Text style={styles.buttonText}>Jugar de nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', paddingTop: 16 },
  centro: { flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  botonDificultad: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    width: 220,
  },
  botonDificultadTexto: { fontSize: 18, fontWeight: '700', color: '#6366f1' },
  botonDificultadSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  marcador: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CELL * 8 + 4,
    marginBottom: 8,
  },
  marcadorTexto: { fontSize: 15, fontWeight: '700', color: '#374151' },
  mensajeGano: { fontSize: 18, fontWeight: 'bold', color: '#10b981', marginBottom: 8 },
  mensajePerdio: { fontSize: 18, fontWeight: 'bold', color: '#ef4444', marginBottom: 8 },
  tablero: {
    borderWidth: 2,
    borderColor: '#9ca3af',
  },
  celda: {
    width: CELL,
    height: CELL,
    backgroundColor: '#d1d5db',
    borderWidth: 0.5,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celdaRevelada: {
    backgroundColor: '#f3f4f6',
  },
  celdaMina: {
    backgroundColor: '#fecaca',
  },
  bandera: { fontSize: 16 },
  minaTexto: { fontSize: 16 },
  numero: { fontSize: 16, fontWeight: 'bold' },
  button: {
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});