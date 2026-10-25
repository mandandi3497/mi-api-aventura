// Endpoint para saludar a una persona mediante el parámetro nombre.
module.exports = (req, res) => {
    const nombre = req.query.nombre;

    // Comprueba si se ha proporcionado un nombre.
    if (!nombre || !nombre.trim()) {
        return res.status(400).json({
            mensaje: "Debes proporcionar un nombre."
        });
    }

    // Devuelve un saludo personalizado.
    res.status(200).json({
        mensaje: `Hola, ${nombre.trim()}!`
    });
};