import mongoose from "mongoose";

//Creamos el Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String
    },
    nick:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    estado:{
        type: Boolean,
        default: true
    },
    role:{
        type: String,
        default:"role_user"
    },
    imagen:{
        type: String,
        default:"no-image.jpg"
    },
    bio:{
        type: String,
        default: ''
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
UserSchema.methods.toJSON = function(){
    const {__v, password, _id, estado, role, ...user} = this.toObject();
    user.uid = _id;
    return user;
}

//Creamos el modelo dentro colocamos el nombre de la coleccion y le pasamos el schema, la coleccione ahora en mongo sera Articulo
const User = mongoose.model('User',UserSchema);

//Exportamos el modelo
export default User;