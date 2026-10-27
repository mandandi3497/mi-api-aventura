require("dotenv").config();

const jwt = require("jsonwebtoken");

/**

* Comprueba que una solicitud incluya un token JWT válido.
*
* @param {import("express").Request} req Solicitud HTTP.
* @param {import("express").Response} res Respuesta HTTP.
* @param {import("express").NextFunction} next Función para continuar.
* @returns {void} Continúa si el token es válido o devuelve un error.
  */
  function autenticarToken(req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET;

  // No permite autenticar si falta la clave secreta.
  if (!JWT_SECRET) {
  console.error("La variable JWT_SECRET no está configurada.");

   return res.status(500).json({
       mensaje: "La autenticación no está configurada correctamente."
   });

  }

  // Obtiene la cabecera Authorization.
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
  return res.status(401).json({
  mensaje: "Debes proporcionar un token de autenticación."
  });
  }

  // Extrae el token de la cabecera.
  const token = autorizacion.slice(7).trim();

  if (!token) {
  return res.status(401).json({
  mensaje: "Debes proporcionar un token de autenticación."
  });
  }

  try {
  // Verifica la firma y la caducidad del token.
  req.usuarioAutenticado = jwt.verify(token, JWT_SECRET);

   return next();

  } catch (error) {
  return res.status(401).json({
  mensaje: "El token no es válido o ha caducado."
  });
  }
  }

module.exports = autenticarToken;
