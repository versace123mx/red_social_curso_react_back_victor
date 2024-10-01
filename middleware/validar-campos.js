import { validationResult } from 'express-validator';

const validarCampos = (req, res, next) =>{
    //Capturamos los errores de la dependencia de validacion
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ status: "error", msg: "Errores de validación", result: errors.array() })
    }
    next()
}

export {
    validarCampos
}