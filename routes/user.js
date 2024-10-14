import { Router } from "express";
import { check } from 'express-validator'
import { validarCampos, validarArchivoSubir, validarJWT } from '../middleware/index.js'
import { register, login, getDataUserlogin, getUserProfileXId, list , update, updateImage, muestraImagenPerfil, muestraImagenXNombre, showCounters } from "../controllers/index.js";
const route = Router();

//Rutas publicas

//Ruta para crear el usuario
route.post('/user',[
    check('name','El campo nombre es requerido').notEmpty().trim().toLowerCase(),
    check('name','El campo nombre debe ser minimo de 3 caracteres').isLength({min:3,max:50}).trim().toLowerCase(),
    check('nick','El campo nick es requerido').notEmpty().trim().toLowerCase(),
    check('nick','El campo nick debe ser minimo de 3 caracteres').isLength({min:3,max:50}).trim().toLowerCase(),
    check('email','El campo email es requerido').notEmpty().trim().toLowerCase(),
    check('email','El campo email no tine formato de email valido').isEmail().trim().toLowerCase(),
    check('password','El campo password es requerido').notEmpty().trim(),
    check('password','El password debe de ser minimo de 8 caracteres').isLength({min:8,max:70}).trim(),
    check('surname').trim().toLowerCase(),
    validarCampos
],register)

//Ruta para el login y generar token
route.post('/login',[
    check('email','El campo email es requerido').notEmpty().trim().toLowerCase(),
    check('email','El campo email no tine formato de email valido').isEmail().trim().toLowerCase(),
    check('password','El campo password es requerido').notEmpty().trim(),
    validarCampos
],login)


//Rutas protegidas con el middleware

//obtener perfil del user logueado validando su token
route.get('/profile-user',validarJWT,getDataUserlogin)

//Ruta para obtener un perfil por id
route.get('/profile/:id',[
    validarJWT,
    check('id','No es un id de Mongo valido').isMongoId(),
    validarCampos
],getUserProfileXId)

//listar y paginar registros
route.get('/list',validarJWT,list)

//Ruta actualizar usuario solo de el mismo que esta loguado y tiene token
route.put('/update',[
    validarJWT,
    check('name','El campo Name no debe de estar vacio').rtrim().notEmpty().toLowerCase(),
    check('surname','El campo Surname no debe de estar vacio').rtrim().notEmpty().toLowerCase(),
    check('bio','El campo bio no debe de estar vacio').rtrim().toLowerCase(),
    validarCampos
],update)

//Ruta para actualizar imagen
route.put('/update-image',[validarJWT,validarArchivoSubir],updateImage)

//Ruta para mostrar la imagen de perfil logueado
route.get('/mostrar-imagen-perfil',validarJWT,muestraImagenPerfil)


//Ruta para mostrar la imagen de perfil por nombre de imagen
route.get('/mostrar-imagen-nombre/:nombreimagen',muestraImagenXNombre)

//Ruta para mostrar los contadores del usuario logueado o del id que se le pase
route.get('/show-counters/:id?',validarJWT,showCounters)

export default route