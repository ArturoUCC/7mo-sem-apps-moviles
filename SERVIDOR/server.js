const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const HOSTS = "ac-tsejomw-shard-00-00.8atiiau.mongodb.net:27017,ac-tsejomw-shard-00-01.8atiiau.mongodb.net:27017,ac-tsejomw-shard-00-02.8atiiau.mongodb.net:27017";
const OPCIONES = "?ssl=true&replicaSet=atlas-twezgn-shard-0&authSource=admin&appName=Cluster0";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

let client = null;
let db = null;

// LOGIN: intenta conectarse a Atlas con las credenciales recibidas
app.post("/login", async (req, res) => {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    const uri = `mongodb://${encodeURIComponent(usuario)}:${encodeURIComponent(password)}@${HOSTS}/${OPCIONES}`;
    const nuevo = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

    try {
        await nuevo.connect();
        // Prueba real: leer algo de la colección para confirmar credenciales y permisos
        await nuevo.db("sample_mflix").collection("movies").findOne({}, { projection: { _id: 1 } });

        if (client) await client.close();
        client = nuevo;
        db = client.db("sample_mflix");

        console.log(`Sesión iniciada con el usuario ${usuario}`);
        res.json({ usuario });
    } catch (error) {
        await nuevo.close().catch(() => {});
        const authFallo = error.code === 18 || /auth/i.test(error.message);
        if (authFallo) {
            res.status(401).json({ error: "Usuario o contraseña de MongoDB incorrectos" });
        } else {
            console.error(error);
            res.status(500).json({ error: "No se pudo conectar a MongoDB (revisa Network Access en Atlas)" });
        }
    }
});

// LOGOUT: cierra la conexión
app.post("/logout", async (req, res) => {
    if (client) await client.close();
    client = null;
    db = null;
    res.json({ ok: true });
});

// Middleware: solo deja pasar si ya hubo login
function requiereLogin(req, res, next) {
    if (!db) return res.status(401).json({ error: "Primero inicia sesión" });
    next();
}

// Lista de películas
app.get("/movies", requiereLogin, async (req, res) => {
    try {
        const movies = await db.collection("movies").find(
            {}, { projection: { poster: 1, title: 1, fullplot: 1 } }
        ).limit(50).toArray();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los datos de la colección" });
    }
});

// Detalle completo de una película
app.get("/movies/:id", requiereLogin, async (req, res) => {
    try {
        const movie = await db.collection("movies").findOne({ _id: new ObjectId(req.params.id) });
        if (!movie) return res.status(404).json({ error: "Película no encontrada" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la película" });
    }
});

app.listen(port, () => {
    console.log("Servidor en http://localhost:4000");
});