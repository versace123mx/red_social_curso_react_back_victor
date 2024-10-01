import mongoose from "mongoose";

//Creamos el Schema
const FollowSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, //este es el que indica que sera un tipo id objeto
        ref: 'User', //este es la referencia asia el id del usuario
        default: null
    },
    followed: {
        type: mongoose.Schema.Types.ObjectId, //este es el que indica que sera un tipo id objeto
        ref: 'User', //este es la referencia asia el id del usuario
        default: null
    },
    estado:{
        type: Boolean,
        default: true
    },
    create_at:{
        type: Date,
        default:Date.now
    },
    update_at:{
        type: Date,
        default:Date.now
    }
})

//Retornamos solo los datos que nesecitamos ver no el passsword, no el __v, no _id esto es del Schema y al _id le cambiamos el nombre visualmente
FollowSchema.methods.toJSON = function(){
    const {__v, password, _id, estado, role, ...follow} = this.toObject();
    follow.uid = _id;
    return follow;
}

//Creamos el modelo dentro colocamos el nombre de la coleccion y le pasamos el schema, la coleccione ahora en mongo sera Articulo
const Follow = mongoose.model('Follow',FollowSchema);

//Exportamos el modelo
export default Follow;