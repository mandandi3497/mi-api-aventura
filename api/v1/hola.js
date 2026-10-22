module.exports = (req, res) => {
    res.status(200).json({
        mensaje: process.env.MENSAJE_BIENVENIDA || "¡API actualizada y mejorada!"
    });
};
