const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Crea la aplicación de Express para la documentación.
const app = express();

/**

* Carga la documentación de la API desde el archivo YAML.
  */
  try {
  const rutaDocumentacion = path.join(
  process.cwd(),
  "swagger.yaml"
  );

  const documentacion = YAML.load(rutaDocumentacion);

  // Comprueba que el documento contiene los endpoints.
  if (!documentacion || !documentacion.paths) {
  throw new Error(
  "El archivo Swagger no contiene las rutas de la API."
  );
  }

  // Adapta las peticiones de recursos que llegan desde Vercel.
  app.use((req, res, next) => {
  const recurso = req.query.asset;

   if (typeof recurso !== "string" || !recurso) {
       return next();
   }

   // Solo admite nombres de recursos, sin rutas adicionales.
   if (path.basename(recurso) !== recurso) {
       return res.status(400).json({
           mensaje: "La ruta del recurso no es válida."
       });
   }

   // Recupera la ruta original para que Swagger la gestione.
   req.url = "/" + recurso;

   return next();

  });

  // Configura Swagger UI para mostrar la documentación.
  app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(documentacion, {
  explorer: true,
  customSiteTitle: "Documentación de Mi API de Aventura"
  })
  );
  } catch (error) {
  console.error(
  "Error al cargar la documentación Swagger:",
  error.message
  );

  app.use((req, res) => {
  return res.status(500).json({
  mensaje: "No se pudo cargar la documentación de la API."
  });
  });
  }

// Exporta la aplicación para que Vercel pueda atender las solicitudes.
module.exports = app;
