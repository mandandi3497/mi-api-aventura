require("dotenv").config();

const mongoose = require("mongoose");

// Guarda la conexión en curso para reutilizarla.
let conexionEnCurso = null;

/**
 * Conecta la aplicación con MongoDB Atlas.
 *
 * @returns {Promise<typeof mongoose>} Instancia de Mongoose conectada.
 * @throws {Error} Si falta la configuración o falla la conexión.
 */
async function conectarDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!conexionEnCurso) {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error(
                "No se ha configurado la variable MONGODB_URI."
            );
        }

        conexionEnCurso = mongoose.connect(uri).catch((error) => {
            conexionEnCurso = null;
            throw error;
        });
    }

    await conexionEnCurso;

    return mongoose;
}

module.exports = conectarDB;