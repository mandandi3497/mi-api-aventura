const mongoose = require("mongoose");

/**
 * Esquema que define los datos de un usuario.
 */
const usuarioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, "El nombre es obligatorio."],
            trim: true
        },
        email: {
            type: String,
            required: [true, "El correo electrónico es obligatorio."],
            trim: true,
            lowercase: true
        }
    },
    {
        timestamps: true
    }
);

// Reutiliza el modelo si ya ha sido registrado.
const Usuario =
    mongoose.models.Usuario ||
    mongoose.model("Usuario", usuarioSchema);

module.exports = Usuario;