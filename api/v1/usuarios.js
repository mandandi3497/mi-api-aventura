const conectarDB = require("../../config/database");
const Usuario = require("../../config/models/Usuario");
const autenticarToken = require("../../middleware/autenticacion");

/**
 * Devuelve los usuarios almacenados en MongoDB
 * únicamente si la solicitud está autenticada.
 *
 * @param {import("express").Request} req Solicitud HTTP.
 * @param {import("express").Response} res Respuesta HTTP.
 * @returns {void} Devuelve los usuarios o un mensaje de error.
 */
module.exports = (req, res) => {
    // Solo se permiten peticiones GET.
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");

        return res.status(405).json({
            mensaje: "Método no permitido."
        });
    }

    // Comprueba el token antes de acceder a MongoDB.
    return autenticarToken(req, res, async () => {
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
    });
};