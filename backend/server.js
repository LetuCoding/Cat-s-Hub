const express = require('express');
//const fetch = require('node-fetch'); // Asegúrate de que esta línea esté aquí
const cors = require('cors');
require('dotenv').config(); // Para cargar las variables de entorno desde .env

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Ruta para obtener los juegos
app.get('/api/games', async (req, res) => {
    const CLIENT_ID = process.env.CLIENT_ID; // Obtener el Client ID del archivo .env
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // Obtener el Access Token del archivo .env

    if (!CLIENT_ID || !ACCESS_TOKEN) {
        return res.status(400).json({ error: 'Faltan las credenciales (Client ID o Access Token)' });
        
    }
    
    try {
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: "fields name, rating, release_dates.date, platforms.name; where platforms = (6,167,169) & rating > 85 & release_dates.date >= 1600531200 & release_dates.date < 1767225600; sort rating desc; limit 50;",
            // Pasamos el body desde el cliente
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: 'Error en la API de IGDB', details: errorData });
        }

        const data = await response.json();
        res.json(data); // Devuelves los datos obtenidos de la API de IGDB
    } catch (error) {
        console.error('Error interno del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  
});
