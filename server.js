const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Permite recibir y procesar datos en formato JSON.
app.use(express.json());

// Ruta principal para comprobar que el servidor funciona.
app.get("/", (req, res) => {
    res.status(200).json({
        mensaje: "¡Bienvenido a mi API de aventura!"
    });
});

// Inicia el servidor.
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});