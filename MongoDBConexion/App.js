import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, Image, ActivityIndicator,
  TextInput, TouchableOpacity, Modal, ScrollView,
} from 'react-native';

const API = "http://localhost:4000"; // cambia por tu IP si usas celular

/* ---------- LOGIN ---------- */
function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setError('');
    setCargando(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.usuario);
      } else {
        setError(data.error || 'No se pudo iniciar sesión');
      }
    } catch (e) {
      setError('No se pudo conectar con el servidor');
    }
    setCargando(false);
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginTitle}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Cuenta de MongoDB</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        autoCapitalize="none"
        value={usuario}
        onChangeText={setUsuario}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={entrar} disabled={cargando}>
        {cargando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>
    </View>
  );
}

/* ---------- MODAL DE DETALLE ---------- */
function Dato({ label, valor }) {
  if (valor === undefined || valor === null || valor === '') return null;
  const texto = Array.isArray(valor) ? valor.join(', ') : String(valor);
  if (!texto) return null;
  return (
    <View style={styles.dato}>
      <Text style={styles.datoLabel}>{label}</Text>
      <Text style={styles.datoValor}>{texto}</Text>
    </View>
  );
}

function DetalleModal({ movieId, onClose }) {
  const [movie, setMovie] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!movieId) return;
    setMovie(null);
    setError('');
    setCargando(true);
    fetch(`${API}/movies/${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setMovie(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo cargar la película');
        setCargando(false);
      });
  }, [movieId]);

  return (
    <Modal visible={!!movieId} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={styles.cerrar}>
          <Text style={styles.cerrarTexto}>✕ Cerrar</Text>
        </TouchableOpacity>

        {cargando && <ActivityIndicator size="large" color="#07f" style={{ marginTop: 40 }} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {movie && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {movie.poster ? (
              <Image source={{ uri: movie.poster }} style={styles.posterGrande} resizeMode="contain" />
            ) : (
              <View style={[styles.noPoster, styles.posterGrande]}>
                <Text>No Imagen</Text>
              </View>
            )}

            <Text style={styles.modalTitle}>{movie.title}</Text>

            <Dato label="Año" valor={movie.year} />
            <Dato label="Estreno" valor={movie.released ? new Date(movie.released).toLocaleDateString('es-MX') : null} />
            <Dato label="Clasificación" valor={movie.rated} />
            <Dato label="Duración" valor={movie.runtime ? `${movie.runtime} min` : null} />
            <Dato label="Géneros" valor={movie.genres} />
            <Dato label="Directores" valor={movie.directors} />
            <Dato label="Guionistas" valor={movie.writers} />
            <Dato label="Reparto" valor={movie.cast} />
            <Dato label="Países" valor={movie.countries} />
            <Dato label="Idiomas" valor={movie.languages} />
            <Dato label="IMDb" valor={movie.imdb?.rating ? `${movie.imdb.rating} (${movie.imdb.votes} votos)` : null} />
            <Dato label="Premios" valor={movie.awards?.text} />
            <Dato label="Sinopsis" valor={movie.fullplot || movie.plot || 'Sin descripción'} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

/* ---------- LISTA DE PELÍCULAS ---------- */
function Peliculas({ usuario, onLogout }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    fetch(`${API}/movies`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const salir = async () => {
    try { await fetch(`${API}/logout`, { method: 'POST' }); } catch (e) {}
    onLogout();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#07f" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSeleccionada(String(item._id))}>
      {item.poster ? (
        <Image source={{ uri: item.poster }} style={styles.poster} />
      ) : (
        <View style={styles.noPoster}>
          <Text>No Imagen</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={4}>{item.fullplot || "Sin descripcion"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hola, {usuario}</Text>
        <TouchableOpacity onPress={salir}>
          <Text style={styles.logout}>Salir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={movies}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <DetalleModal movieId={seleccionada} onClose={() => setSeleccionada(null)} />
    </View>
  );
}

/* ---------- APP ---------- */
export default function App() {
  const [usuario, setUsuario] = useState(null);

  if (!usuario) return <Login onLogin={setUsuario} />;
  return <Peliculas usuario={usuario} onLogout={() => setUsuario(null)} />;
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  poster: { width: 90, height: 130, backgroundColor: '#ddd' },
  noPoster: { width: 90, height: 130, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ddd' },
  info: { flex: 1, marginLeft: 10 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },

  loginContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  loginTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#07f', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: 'red', marginBottom: 8, textAlign: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderColor: '#eee',
  },
  headerText: { fontSize: 18, fontWeight: 'bold' },
  logout: { color: '#07f', fontSize: 16 },

  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 16 },
  cerrar: { alignSelf: 'flex-end', padding: 8 },
  cerrarTexto: { color: '#07f', fontSize: 16 },
  posterGrande: { width: '100%', height: 300, marginBottom: 12, backgroundColor: '#ddd' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  dato: { marginBottom: 10 },
  datoLabel: { fontWeight: 'bold', color: '#555' },
  datoValor: { fontSize: 15 },
});