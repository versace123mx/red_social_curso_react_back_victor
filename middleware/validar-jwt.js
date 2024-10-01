import jwt from 'jsonwebtoken';
import User from '../models/User.js'

const validarJWT = async (req,res,next) =>{
    
    const token = req.header('x-token')//con header() solo obtenemos el valor que queremos con headers obtenemos toda la cabecera
    if(!token){
        return res.status(401).json({status:"error",msg: 'No hay token en la peticion', result:[]})
    }

    try {
        const { uid } = jwt.verify(token,process.env.JWT_SECRET)

        //leer el usuario que corresponde al uid
        const usuario = await User.findById(uid)

        //si el usuario no existe
        if(!usuario){
            return res.status(401).json({status:"error", msg: 'Token no valido - usuario no existe en DB', result:[]})
        }

        //verificar si el uid tiene estado en true
        if(!usuario.estado){
            return res.status(401).json({status:"error", msg: 'Token no valido - usuario deshabilitado', result:[]})
        }
        req.usuario = usuario
        next()
    } catch (error) {
        res.status(401).json({status:"error", msg: 'Token no valido', result:[]})
    }

}

export default validarJWT