import mongoose from "mongoose";

//Creamos el Schema
const LogSchema = mongoose.Schema({
    accion: {
        type: String,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId, //este es el que indica que sera un tipo id objeto
        ref: 'User', //este es la referencia asia el id del usuario
        default: null
    },
    host:{
        type: String
    },
    ip:{
        type: String
    },
    pathUrl:{
        type: String
    },
    create_at:{
        type: Date,
        default:Date.now
    }
})


//Creamos el modelo dentro colocamos el nombre de la coleccion y le pasamos el schema, la coleccione ahora en mongo sera Articulo
const Log = mongoose.model('Log',LogSchema);

//Exportamos el modelo
export default Log;