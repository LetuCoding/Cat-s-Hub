// Selección de elementos del DOM
const gamesGrid = document.getElementById('gamesGrid');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const closeModalBtn = document.getElementById('closeModal');

// Endpoint del servidor proxy
const PROXY_URL = 'http://localhost:3000/api/games';

// Función para obtener juegos desde el proxy
async function fetchGames() {
    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: 'name', limit: 1 }),
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos de juegos');
        }

        const games = await response.json();
        displayGames(games);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para mostrar los juegos en el grid
function displayGames(games) {
    games.forEach(game => {
        const card = document.createElement('div');
        card.classList.add('game-card');
        card.innerHTML = `<h3>${game.name}</h3>`;
        card.addEventListener('click', () => openModal(game));
        gamesGrid.appendChild(card);
    });
}

// Función para abrir el modal con detalles del juego
function openModal(game) {
    modalTitle.textContent = game.name;
    modalDescription.textContent = game.summary || 'No hay descripción disponible.';
    gameModal.style.display = 'flex';
}

// Función para cerrar el modal
closeModalBtn.addEventListener('click', () => {
    gameModal.style.display = 'none';
});

// Cargar los juegos al cargar la página
fetchGames();
