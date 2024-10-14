import User from '../models/User.js'
import Follow from '../models/Follow.js'
import {mongoose} from "mongoose";


//Accion de guardar un follow (accion seguir)
const follow = async (req, res) => {
    
    const { idfolow } = req.body
    
    if(idfolow == req.usuario.id){
        return res.status(400).json({status:"error",msg:"No te puedes seguir a ti mismo.",result:[]})
    }
    
    try {

        //validamos que el usuario a seguir exita y su estado sea true
        const verificaUser = await User.findById(idfolow)

        if( !verificaUser || !verificaUser.estado ){
            return res.status(400).json({status:"error",msg:"El usuario no existe o fue dado de baja.",result:[]})
        }
        //validamos que no se siga ya previamente
        const verificaFollow = await Follow.find({
            $and:[
                {user:req.usuario.id},{followed:idfolow}
            ]
        })

        //Si el usuario ya se sigue entonces mandamos un error de que no se puede volver a seguir
        if( verificaFollow.length ){
            return res.status(400).json({status:"error",msg:"El usuario ya esta en seguimiento.",result:[]})
        }

        const follow = new Follow({user:req.usuario.id,followed:idfolow})
        const resultFollow = await follow.save()
        res.status(200).json({status:"success",msg:"follow correctamente",result:[]})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"No se pudo realizar el seguimiento.", result:[error]})
    }
}

//Accion de borrar un follow (accion dejar de seguir)
const unfollow = async (req, res) => {
    
    const { id } = req.params

    try {
    
        const {deletedCount} = await Follow.deleteOne({
            $and:[
                {user:req.usuario.id},{followed:id}
            ]
        })
        console.log(deletedCount)
        if( !deletedCount ){
            return res.status(400).json({status:"error",msg:"No se pudo eliminar, vuelve a intentarlo o quizas ya ha sido eliminado.",result:[]})
        }
    
        
        res.status(200).json({status:"success",msg:"un-follow", result:[]})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Error al intentar borrar el usuario.", result:[error]})
    }
    
}

//Accion listado de usuarios que estoy siguiendo
const following = async (req, res) => { 

    let iduser = req.usuario.id
    
    //si llega el id buscamos por usuario id
    if(req.params.id){
        iduser = req.params.id
    }
    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }

    try {

        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, nameUser, datosUser,following,followers] = await Promise.all([
            Follow.countDocuments({user:iduser,estado: true}), //cuento cuantos usuarios sigo
            
            //Traigo el nombre del usuario que hace la peticion
            User.find({_id:iduser, estado:true}).select('name surname'),
            //se llama a los id de los seguidores y se popula para traer sus datos desde user
            Follow.find({user:iduser,estado: true}).select('followed')
            .populate({
                path:'followed',
                select:'-create_at -update_at -email -password -estado -role -__v'
            })
            .skip((pagina-1)*limite).limit(limite).sort({create_at:-1}),

            //a quien sigue y quien lo sigue del usuario que hace la peticion
            Follow.find({estado: true, user:iduser}).select("followed"),
            Follow.find({estado: true, followed:iduser}).select("user"),
        ])

        let siguiendo = following.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
        let quientesigue = followers.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow

        if(!datosUser.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",result:[] })
        }
        
        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado x user",
        totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,
        following:siguiendo,
        followe_me:quientesigue,
        nameUser,
        result:datosUser})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",result:[] })
    }
}

//Accion listado de usuarios que me siguen
const followers = async (req, res) => {

    let iduser = req.usuario.id
    
    //si llega el id buscamos por usuario id
    if(req.params.id){
        iduser = req.params.id
    }
    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }

    try {

        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, nameUser, datosUser,following,followers] = await Promise.all([
            Follow.countDocuments({followed:iduser,estado: true}), //cuento cuantos usuarios sigo
            
            //Traigo el nombre del usuario que hace la peticion
            User.find({_id:iduser, estado:true}).select('name surname'),
            //se llama a los id de los seguidores y se popula para traer sus datos desde user
            Follow.find({followed:iduser,estado: true}).select('user')
            .populate({
                path:'user',
                select:'-create_at -update_at -email -password -estado -role -__v'
            })
            .skip((pagina-1)*limite).limit(limite).sort({create_at:-1}),

            //a quien sigue y quien lo sigue del usuario que hace la peticion
            Follow.find({estado: true, user:iduser}).select("followed"),
            Follow.find({estado: true, followed:iduser}).select("user"),
        ])

        let siguiendo = following.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
        let quientesigue = followers.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow

        if(!datosUser.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",data:[] })
        }
        
        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado x user",
        totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,
        following:siguiendo,
        followe_me:quientesigue,
        nameUser,
        result:datosUser})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",data:[] })
    }
}

export{
    follow,
    unfollow,
    following,
    followers
}