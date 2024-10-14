import fs from 'fs'
import mongoose from "mongoose";
import { Publication, Follow } from '../models/index.js'
import { subirArchivo } from '../helper/subir-archivo.js'

//Guardar Publicacion
const createPublication = async (req, res) => {

    const { publicacion } = req.body

    try {
        const modeloPublicacion = await new Publication({text:publicacion,user:req.usuario.id})
        modeloPublicacion.save({new:true})
        res.status(200).json({status:"success",msg:"Publicacion guardada exitosamente",result:[modeloPublicacion] })
    } catch (error) {
        res.status(404).json({ status: "error", msg:"Error al guardar la publicacion.",result:[error]})
    }

}

//Sacar una publicacion
const showPublication = async (req,res) => {

    const { id } = req.params

    try {

        const result = await Publication.find({
            $and:[
                {_id:id},{estado:true}
            ]
        })
        .select('-update_at')// del modelo Publication quitamos el update_at
        .populate('user',"-password -estado -role -imagen -update_at -__v -bio -create_at")//del usuario que creo la publicacion quitamos todos estos campos
    
        if(!result.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",result:[] })
        }
    
        res.status(200).json({status:"success",msg:"Publicacion show",result:result })

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",result:[error] })
    }

}

//eliminar publicaciones
const deletePublication = async (req, res) => {

    const { id } = req.params

    try {
        const result = await Publication.findOneAndUpdate({
            _id:id,
            user:req.usuario.id,
            estado:true
            },
            {$set:{estado:false}}
        )

        if(!result){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",result:[] })
        }
    
        res.status(200).json({status:"success",msg:"Eliminar Publicaciones",result:[] })
    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",result:[error] })
    }
}

//Listar todas las publicaciones del usuario logueado
const showPublications = async (req, res) => {

    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }

    try {

        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, post] = await Promise.all([
            Publication.countDocuments({user:req.usuario.id,estado: true}),
            Publication.find({user:req.usuario.id,estado: true})
            .skip((pagina-1)*limite).limit(limite).sort({create_at:-1})
        ])

        if(!post.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",result:[] })
        }

        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"muetra todas las publicaciones del usuario logueado",
        totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,result:post})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",result:[error] })
    }
    
}

//listar publicaciones de un usuario
const showPublicationsForUser = async (req, res) => {

    const { id } = req.params
    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }

    try {

        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, post] = await Promise.all([
            Publication.countDocuments({user:id,estado: true}),
            Publication.find({user:id,estado: true})
            .skip((pagina-1)*limite).limit(limite)
        ])

        if(!post.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",result:[] })
        }

        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado x user",
        totalRegistros:total,pagina:Number(pagina),totalPaginas,numRegistrosMostrarXPagina:limite,result:post})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",result:[error] })
    }

}

//subir ficheros (actualizar imagen de la publicacion)
const updateUploadImage = async (req, res) => {

    const { id } = req.params

    try {

        //verificar si la publicacion esta activa y verificamos si corresponde con el id
        const validaPublication = await Publication.find({_id:id,user:req.usuario.id,estado:true})
        if(!validaPublication.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",result:[] })
        }
        
        //si existe el campo file es por que tiene una imagen asociada
        if(validaPublication[0].file){
            const pathImage = './uploads/publication/' + validaPublication[0].file //creamos la ruta de la imagen previa
            //verificamos si existe la imagen
            if (fs.existsSync(pathImage)) {
                    fs.unlinkSync(pathImage)//en caso de que la imagen previa exista procedemos a eliminarla
            }
        }

        const nombre = await subirArchivo(req.files, undefined,'publication')
        const result = await Publication.findOneAndUpdate({_id:id},{
            file:nombre,update_at:Date.now()
        },{ new: true })
        res.status(200).json({ status: "success", msg:"Imagen Actualizada Correctamente", result:[]})
    } catch (error) {
        return res.status(400).json({ status: "error", msg:"No se pudo actualizar la imagen catch.",result:[error]})
    }

}

//devolver archivos multimedia imagenes
const showMediaforName = async (req, res) => {
    
    const {nombreimagen} = req.params
    try {

        //creamos la ruta de la imagen previa
        let pathImage = `${process.cwd()}/uploads/publication/${nombreimagen}`

        //verificamos si existe la imagen
        if (fs.existsSync(pathImage)) {
            return res.sendFile(pathImage)
        }

        pathImage = `${process.cwd()}/assets/no-image.jpg`
        return res.sendFile(pathImage)

    } catch (error) {
        res.status(400).json({ status: "error", msg: "Error Al obtenr la Imagen.", result:[error] })
    }
}


//Mostra las postulaciones de usuarios que sigo
const showPublicationForFollowing = async (req, res) => {

    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }
    
    try {
        
        const followedUsers = await Follow.find({ user: req.usuario.id }).select('followed');

        //si no hay seguimiento mandamos error
        if(!followedUsers.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados 1",result:[] })
        }

        const followedUserIds = followedUsers.map(follow => follow.followed);

        const publications = await Publication.find({ user: { $in: followedUserIds},estado:true })
        .select("-estado -update_at -__v")
        .populate('user',"-password -estado -role -imagen -update_at -__v -bio -create_at, -email")
        .skip((pagina-1)*limite).limit(limite).sort({create_at:-1});

        //si no hay publicaciones mandamos error
        if(!publications.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados 2",result:[] })
        }

        const total = await Publication.countDocuments({ user: { $in: followedUserIds },estado:true });
        publications.push({'Following':followedUserIds}) //agregamos los id de los usuarios que seguimos
        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado",
        totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,result:publications})
        
    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",result:[error] })
    }
}

export {
    createPublication,
    showPublication,
    deletePublication,
    showPublications,
    showPublicationsForUser,
    updateUploadImage,
    showMediaforName,
    showPublicationForFollowing
}