const validarArchivoSubir = (req, res, next) =>{
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
        return res.status(400).json({status: "error",msg:'No hay archivos en la peticion.',result:[]});
    }
    next()
}

export {
    validarArchivoSubir
}