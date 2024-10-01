import mongoose from "mongoose";

//Creamos el Schema
const PublicationSchema = mongoose.Schema({
    text:{
        type: String,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, //este es el que indica que sera un tipo id objeto
        ref: 'User' //este es la referencia asia el id del usuario
    },
    estado:{
        type: Boolean,
        default: true
    },
    file:{
        type: String,
        default: "no-image.jpg"
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
PublicationSchema.methods.toJSON = function(){
    const {__v, _id, estado, ...publication} = this.toObject();
    publication.uid = _id;
    return publication;
}

//Creamos el modelo dentro colocamos el nombre de la coleccion y le pasamos el schema, la coleccione ahora en mongo sera Articulo
const Publication = mongoose.model('Publication',PublicationSchema);

//Exportamos el modelo
export default Publication;