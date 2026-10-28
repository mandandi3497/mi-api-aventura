require("dotenv").config();

const jwt = require("jsonwebtoken");

/**
 * Comprueba las credenciales y genera un token JWT si son válidas.
 *
 * @param {import("express").Request} req Solicitud HTTP.
 * @param {import("express").Response} res Respuesta HTTP.
 * @returns {import("express").Response} Respuesta con el token o un error.
 */
module.exports = (req, res) => {
    // El inicio de sesión solo admite peticiones POST.
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");

        return res.status(405).json({
            mensaje: "Método no permitido."
        });
    }

    // Comprueba que las variables de autenticación estén configuradas.
    const {
        JWT_USUARIO,
        JWT_PASSWORD,
        JWT_SECRET
    } = process.env;

    if (!JWT_USUARIO || !JWT_PASSWORD || !JWT_SECRET) {
        console.error(
            "Falta configurar alguna variable de autenticación."
        );

        return res.status(500).json({
            mensaje: "La autenticación no está configurada correctamente."
        });
    }

    // Obtiene las credenciales recibidas en el cuerpo de la petición.
    const { usuario, password } = req.body || {};

    // Comprueba que se hayan proporcionado ambas credenciales.
    if (
        typeof usuario !== "string" ||
        typeof password !== "string" ||
        !usuario.trim() ||
        !password
    ) {
        return res.status(400).json({
            mensaje: "Debes proporcionar el usuario y la contraseña."
        });
    }

    // Rechaza las credenciales incorrectas sin revelar cuál ha fallado.
    if (
        usuario.trim() !== JWT_USUARIO ||
        password !== JWT_PASSWORD
    ) {
        return res.status(401).json({
            mensaje: "Credenciales incorrectas."
        });
    }

    // Genera un token que caduca una hora después de su creación.
    const token = jwt.sign(
        { usuario: JWT_USUARIO },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    return res.status(200).json({
        mensaje: "Inicio de sesión correcto.",
        token,
        tipo: "Bearer",
        expiraEn: "1 hora"
    });
};