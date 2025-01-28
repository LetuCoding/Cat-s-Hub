const express = require('express');
const cors = require('cors');
const path = require('path');
const twig = require('twig'); //para usar plantillas twig
require('dotenv').config(); // Para cargar las variables de entorno desde .env

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Twig como motor de plantillas
app.set('view engine', 'twig');  // Usar Twig como motor de plantillas
app.set('views', path.join(__dirname, 'views')); // Establecer el directorio de las vistas
app.use(express.static(path.join(__dirname, 'public')));


app.get('/games', async (req, res) => {
    const CLIENT_ID = process.env.CLIENT_ID;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

    if (!CLIENT_ID || !ACCESS_TOKEN) {
        return res.status(400).json({ error: 'Faltan las credenciales (Client ID o Access Token)' });
    }

    try {
        const gamesResponse = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: "fields name, rating, release_dates.date, platforms.name, cover; sort rating desc; limit 5;",
        });

        if (!gamesResponse.ok) {
            const errorData = await gamesResponse.json();
            return res.status(gamesResponse.status).json({ error: 'Error en la API de IGDB', details: errorData });
        }

        const games = await gamesResponse.json();

        // Ahora obtener la portada de cada juego
        const gamesWithCovers = await Promise.all(games.map(async (game) => {
            if (game.cover) {
                const coverResponse = await fetch(`https://api.igdb.com/v4/covers`, {
                    method: 'POST',
                    headers: {
                        'Client-ID': CLIENT_ID,
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: `fields image_id; where game = ${game.id};`
                });

                if (coverResponse.ok) {
                    const coverData = await coverResponse.json();
                    game.cover_image = coverData.length > 0 ? coverData[0].image_id : null;
                }
            }

            return game;
        }));

        // Enviar los juegos con sus portadas a la plantilla
        res.render('games', {
            title: 'Juegos Populares',
            games: gamesWithCovers,
        });

    } catch (error) {
        console.error('Error interno del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  
});
