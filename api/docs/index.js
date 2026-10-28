const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Crea la aplicación de Express para la documentación.
const app = express();

// Directorio que contiene los archivos estáticos de Swagger UI.
const directorioSwagger = path.dirname(
    require.resolve("swagger-ui-dist")
);

// Recursos estáticos que se permite servir.
const recursosPermitidos = new Set([
    "swagger-ui.css",
    "swagger-ui-bundle.js",
    "swagger-ui-standalone-preset.js",
    "swagger-ui-init.js",
    "favicon-32x32.png",
    "favicon-16x16.png"
]);

/**
 * Carga la documentación y configura Swagger UI.
 */
try {
    const rutaDocumentacion = path.join(
        process.cwd(),
        "swagger.yaml"
    );

    const documentacion = YAML.load(rutaDocumentacion);

    if (!documentacion || !documentacion.paths) {
        throw new Error(
            "El archivo Swagger no contiene las rutas de la API."
        );
    }

    // Opciones de presentación de la documentación.
    const opcionesSwagger = {
        explorer: true,
        customSiteTitle: "Documentación de Mi API de Aventura",
        customCss: ""
    };

    // Genera la página HTML de Swagger.
    const mostrarSwagger = swaggerUi.setup(
        documentacion,
        opcionesSwagger
    );

    /*
     * Obtiene el middleware que genera el archivo
     * JavaScript de inicialización con nuestra documentación.
     */
    const middlewareInicioSwagger =
        swaggerUi.serveFiles(documentacion)[0];

    /*
     * Atiende las peticiones que utilizan el parámetro asset.
     * Esta ruta permite entregar los recursos desde la función
     * de Vercel que gestiona la documentación.
     */
    app.use((req, res, next) => {
        const recurso = req.query.asset;

        // Si no se solicita un recurso, continúa normalmente.
        if (typeof recurso !== "string") {
            return next();
        }

        // Comprueba que el recurso esté autorizado.
        if (!recursosPermitidos.has(recurso)) {
            return res.status(404).json({
                mensaje: "El recurso solicitado no existe."
            });
        }

        // El archivo de inicialización se genera dinámicamente.
        if (recurso === "swagger-ui-init.js") {
            const urlOriginal = req.url;

            // Adapta la URL para el middleware de inicialización.
            req.url = "/swagger-ui-init.js";

            return middlewareInicioSwagger(
                req,
                res,
                (error) => {
                    req.url = urlOriginal;

                    if (error) {
                        return next(error);
                    }

                    if (!res.headersSent) {
                        return res.status(404).json({
                            mensaje:
                                "No se pudo generar la inicialización de Swagger."
                        });
                    }
                }
            );
        }

        // Los demás recursos se sirven desde swagger-ui-dist.
        const rutaRecurso = path.join(
            directorioSwagger,
            recurso
        );

        return res.sendFile(rutaRecurso, (error) => {
            if (error && !res.headersSent) {
                console.error(
                    "Error al servir un recurso de Swagger:",
                    error.message
                );

                res.status(error.statusCode || 500).json({
                    mensaje:
                        "No se pudo cargar un recurso de Swagger."
                });
            }
        });
    });

    /*
     * Sirve Swagger y ajusta las rutas de sus recursos
     * para que utilicen la función /api/docs.
     */
    app.use(
        "/",
        swaggerUi.serve,
        (req, res, next) => {
            const enviarOriginal = res.send.bind(res);

            // Ajusta las URL del HTML antes de enviarlo.
            res.send = (contenido) => {
                if (typeof contenido === "string") {
                    contenido = contenido
                        .replaceAll(
                            'href="./swagger-ui.css"',
                            'href="/api/docs?asset=swagger-ui.css"'
                        )
                        .replaceAll(
                            'href="./favicon-32x32.png"',
                            'href="/api/docs?asset=favicon-32x32.png"'
                        )
                        .replaceAll(
                            'href="./favicon-16x16.png"',
                            'href="/api/docs?asset=favicon-16x16.png"'
                        )
                        .replaceAll(
                            'src="./swagger-ui-bundle.js"',
                            'src="/api/docs?asset=swagger-ui-bundle.js"'
                        )
                        .replaceAll(
                            'src="./swagger-ui-standalone-preset.js"',
                            'src="/api/docs?asset=swagger-ui-standalone-preset.js"'
                        )
                        .replaceAll(
                            'src="./swagger-ui-init.js"',
                            'src="/api/docs?asset=swagger-ui-init.js"'
                        );
                }

                return enviarOriginal(contenido);
            };

            return mostrarSwagger(req, res, next);
        }
    );
} catch (error) {
    console.error(
        "Error al cargar la documentación Swagger:",
        error.message
    );

    app.use((req, res) => {
        res.status(500).json({
            mensaje:
                "No se pudo cargar la documentación de la API."
        });
    });
}

// Exporta la aplicación para que Vercel atienda las solicitudes.
module.exports = app;