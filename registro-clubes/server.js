const http = require('http');
const fs = require('fs');
const path = './clubs.json';

// Función para leer los clubes del archivo JSON
const readClubs = () => {
    try {
        const data = fs.readFileSync(path, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error leyendo clubs.json:", error);
        return [];
    }
};

// Función para guardar los clubes en el archivo JSON
const saveClubs = (clubs) => {
    try {
        fs.writeFileSync(path, JSON.stringify(clubs, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error escribiendo en clubs.json:", error);
    }
};

// Crear el servidor
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/api/register') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const { nombre_club, colores_club, mail_club, contraseña_club } = JSON.parse(body);

            // Validación de datos
            if (!nombre_club || !colores_club || !mail_club || !contraseña_club) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Todos los campos son requeridos' }));
            }

            // Leer clubes actuales
            const clubs = readClubs();

            // Comprobar si el club ya está registrado
            const existingClub = clubs.find(club => club.mail_club === mail_club);
            if (existingClub) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'El club ya está registrado con este correo' }));
            }

            // Agregar el nuevo club y guardar en el archivo
            const newClub = { nombre_club, colores_club, mail_club, contraseña_club };
            clubs.push(newClub);
            saveClubs(clubs);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Club registrado exitosamente' }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});