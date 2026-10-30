require("dotenv").config();

const mongoose = require("mongoose");

// Guarda la conexión en curso para reutilizarla.
let conexionEnCurso = null;

/**
 * Conecta la aplicación con MongoDB Atlas.
 *
 * Utiliza la nueva conexión integrada en Vercel cuando está disponible.
 * En local, permite seguir utilizando MONGODB_URI.
 *
 * @returns {Promise<typeof mongoose>} Instancia de Mongoose conectada.
 * @throws {Error} Si falta la configuración o falla la conexión.
 */
async function conectarDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!conexionEnCurso) {
        // Prioriza la nueva variable de conexión integrada en Vercel.
        // Si no existe, utiliza la variable de conexión anterior.
        const uri =
            process.env.NUEVA_MONGODB_URI ||
            process.env.MONGODB_URI;

        if (!uri) {
            throw new Error(
                "No se ha configurado NUEVA_MONGODB_URI ni MONGODB_URI."
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