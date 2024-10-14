import fs from 'fs'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import generarJWT from '../helper/generarJWT.js'
import { subirArchivo } from '../helper/subir-archivo.js'
import Publication from '../models/Publication.js'
import Follow from '../models/Follow.js'

//Registrar usuario
const register = async (req, res) => {

    //hacemos desestructuring
    const { nick, email, password, ...data } = req.body

    //creamos un objeto usuario y le asignamos los datos que vamos a guardar, los que destructuramos y el resto
    const usuario = new User({ nick, email, password, ...data })

    //validamos si el nick o el email ya existen ya que estos campos son unicos
    const user = await User.findOne({ "$or": [{ nick }, { email }] })
    if (user) {
        return res.status(400).json({ status: "error", msg: "El nickname o el email ya exiten, intenta con otro nickname u otro email", result: [{ "nick": nick, "email": email }] })
    }

    //Encriptar la contraseña
    const salt = bcrypt.genSaltSync()
    usuario.password = bcrypt.hashSync(password, salt) //Encriptamos la contraseña con el salt del objeto usuario.password

    //Guardar en DB
    try {
        await usuario.save()
        res.status(200).json({ status: "success", msg: "Usuario registrado correctamente", result: [usuario] })
    } catch (error) {
        return res.status(400).json({ status: "error", msg: "Se produjo un erro al guardar el registro", result: [error] })
    }
}

//Login de usuario y generar token
const login = async (req, res) => {

    //Extraigo lo que llega en el body
    const { email, password } = req.body

    try {

        //verifico si el usuario existe
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ status: "error", msg: "Usuario no encontrado", result: [] })
        }

        //validar contraseña
        const validPassword = bcrypt.compareSync(password, user.password)
        if (!validPassword) {
            return res.status(400).json({ status: "error", msg: 'El email o password son incorrectos. - password', result: [] })
        }

        //Generar JWT se accede user.id o user._id ya que mongo asi lo permite id es un alias de _id
        const token = generarJWT(user.id)

        res.status(200).json({
            status: "success", msg: "login",
            result: [{ name: user.name, nick: user.nick, email: user.email, token }]
        })
    } catch (error) {
        return res.status(400).json({ status: "error", msg: 'Error en la generacion del token', result: [error] })
    }

}

//Metodo para obtener el perfil del usuario logueado
const getDataUserlogin = async (req, res) => {
    //desde aqui tendriamos que mandar el arreglo de aquien seguimos y quien nos sigue para tener un mayor control en otros casos de busquedas en el front
    try{
        
        //verifico si el usuario existe
        const user = await User.findById(req.usuario.id)
        if (!user) {
            return res.status(400).json({ status: "error", msg: "Usuario no encontrado", result: [] })
        }

        const [follow,followers] = await Promise.all([
            Follow.find({estado: true, user:req.usuario.id}).select("followed"),
            Follow.find({estado: true, followed:req.usuario.id}).select("user")
        ])

        let following = follow.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
        let followe_me = followers.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow


        return res.status(200).json({ status: "success", msg: "Se obtubo de manera correcta los datos del usuario", result: [user,{following},{followe_me}] })

    } catch (error) {
        return res.status(400).json({ status: "error", msg: 'Error al obtenr el usuario', result: [error] })
    }

}

//Metodo para obtener un perfil por id
const getUserProfileXId = async (req, res) => {

    //Recibo los datos del id
    const { id } = req.params

    try{

            const [user,follow,followers] = await Promise.all([
                User.findById(id),
                Follow.find({estado: true, user:id}).select("followed"),
                Follow.find({estado: true, followed:id}).select("user")
            ])

            let following = follow.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
            let followe_me = followers.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow


            res.status(200).json({ status: "success", msg:"desde usuario x id agregando listado de following y follow",result:[user,{following},{followe_me}]})


    } catch (error) {
        return res.status(400).json({ status: "error", msg: 'Error al obtenr el usuario', result: [error] })
    }

}

//Metodo para extraer los usuarios y paginarlos
const list = async (req, res) => {

    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query string http://localhost:5721/api/listar?pagina=2

    if (isNaN(limite) || isNaN(pagina)) {
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros', result:[] });
    }

    try{
        
        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, usuarios,following,follow_me] = await Promise.all([
            User.countDocuments({$and:[{estado: true},{_id: {$ne:req.usuario.id}}]}),
            User.find({$and:[
                {estado: true},
                {_id: {$ne:req.usuario.id}}
            ]
            }).skip((pagina - 1) * limite).limit(limite),

            Follow.find({estado: true, user:req.usuario.id}).select("followed"),
            Follow.find({estado: true, followed:req.usuario.id}).select("user")
        ])

        
        let siguiendo = following.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
        let quientesigue = follow_me.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow
        
        const totalPaginas = Math.ceil(total / limite)
        res.status(200).json({
            status: "success", msg: "desde el listado",
            totalRegistros: total, pagina:Number(pagina), totalPaginas, 
            numRegistrosMostrarXPagina: limite,
            user_following:siguiendo,
            user_follow_me:quientesigue,
            result: usuarios
        })

    }catch(error){
        return res.status(400).json({ status: "error", msg: 'Error al obtenr los usuarios', result: [error] })
    }
}

//Metodo para actualizar datos basicos
const update = async (req, res) => {

    const datos = req.body
    datos.update_at = Date.now()
    try {
        const userUpdate = await User.findByIdAndUpdate(req.usuario.id, datos, { new: true })
        res.status(200).json({ status: "success", msg: "desde update", result: [userUpdate] })
    } catch (error) {
        res.status(400).json({ status: "error", msg: "no se pudieron actualizar los datos.", result: [error] })
    }
}

//Metodo para actualizar la imagen de perfil
const updateImage = async (req, res) => {

    try {
        const { imagen } = req.usuario

        const pathImage = './uploads/user/' + imagen //creamos la ruta de la imagen previa
        //verificamos si existe la imagen
        if (fs.existsSync(pathImage)) {
            fs.unlinkSync(pathImage)//en caso de que la imagen previa exista procedemos a eliminarla
        }

        const nombre = await subirArchivo(req.files, undefined,'user')
        req.usuario.imagen = nombre
        req.usuario.update_at = Date.now()
        await req.usuario.save({ new: true })
        res.status(200).json({ status: "success", msg: "Imagen Actualizada Correctamente",result:[] })
    } catch (error) {
        res.status(400).json({ status: "error", msg: "No se pudo actualizar la imagen.", result:[error] })
    }

}

//Metodo para obtener la imagen de perfil
const muestraImagenPerfil = (req, res) => {

    try {
        //creamos la ruta de la imagen previa
        const pathImage = `${process.cwd()}/uploads/user/${req.usuario.imagen}`

        //verificamos si existe la imagen
        if (fs.existsSync(pathImage)) {
            return res.sendFile(pathImage)
        }

    } catch (error) {
        res.status(400).json({ status: "error", msg: "Error Al obtenr la Imagen.", result:[error] })
    }

    const pathImage = `${process.cwd()}/assets/no-image.jpg`
    return res.sendFile(pathImage)

}

//Metodo para obtener la imagen de perfil
const muestraImagenXNombre = async (req, res) => {
    
    const {nombreimagen} = req.params
    try {
        //creamos la ruta de la imagen previa
        let pathImage = `${process.cwd()}/uploads/user/${nombreimagen}`

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

//contadores de fllowing, followers y publicaciones del usuario logueado o el id que se le pase
const showCounters = async (req, res) => {

    let userId = req.usuario.id;//este es el usuario logueado

    if (req.params.id) {
        userId = req.params.id;
    }

    //verifico si el usuario existe
    const user = await User.findById(userId)
    if (!user) {
        return res.status(400).json({ status: "error", msg: "Usuario no encontrado", result: [] })
    }

    try {

        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [following,followed,publications] = await Promise.all([
            Follow.countDocuments({"user":userId,estado:true}),
            Follow.countDocuments({"followed":userId,estado:true}),
            Publication.countDocuments({"user":userId,estado:true}),
        ])

        const totales = {
            userId,
            following,
            followed,
            publications
        }
        res.status(200).json({ status: "success", msg:"desde el listado x user",result:[totales]})
    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",data:[] })
    }

}

export {
    register,
    login,
    getDataUserlogin,
    getUserProfileXId,
    list,
    update,
    updateImage,
    muestraImagenPerfil,
    muestraImagenXNombre,
    showCounters
}