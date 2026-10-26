const conectarDB = require("../../config/database");
const Usuario = require("../../config/models/Usuario");

/**
 * Devuelve la lista de usuarios almacenados en MongoDB.
 *
 * @param {import("express").Request} req Solicitud HTTP.
 * @param {import("express").Response} res Respuesta HTTP.
 * @returns {Promise<import("express").Response>} Respuesta con los usuarios o un error.
 */
module.exports = async (req, res) => {
    // Solo se permiten peticiones GET.
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");

        return res.status(405).json({
            mensaje: "Método no permitido."
        });
    }

    try {
        // Conecta con MongoDB antes de consultar los usuarios.
        await conectarDB();

        const usuarios = await Usuario.find()
            .select("-__v")
            .lean();

        // Devuelve el número de usuarios y sus datos.
        return res.status(200).json({
            total: usuarios.length,
            usuarios
        });
    } catch (error) {
        console.error(
            "Error al consultar los usuarios:",
            error.message
        );

        return res.status(500).json({
            mensaje: "No se pudieron consultar los usuarios."
        });
    }
};