import {Router} from "express";
import { check } from 'express-validator'
import { validarCampos, validarArchivoSubir, validarJWT } from '../middleware/index.js'
import { createPublication, showPublication, deletePublication, showPublications, showPublicationsForUser, updateUploadImage, showMediaforName, showPublicationForFollowing } from '../controllers/index.js'

const route = Router();

//Rutas de crear publicacion
route.post('/publication/create',[
    validarJWT,
    check('publicacion','La publicacion no debe de estar vacia, minimo tiene que tener 5 caracteres')
    .trim().toLowerCase().notEmpty().isLength({min:5, max:3000}),
    validarCampos
],createPublication)

//Mostrar una publicacion de cualquier usuario
route.get('/publication/show-publication/:id',[
    validarJWT,
    check('id','El id no es un id de Mongo valido').isMongoId(),
    validarCampos
],showPublication)

//Eliminar una publicacion que sea del usuario registrado
route.delete('/publication/delete-publication/:id',[
    validarJWT,
    check('id','El id no es un id de Mongo valido').isMongoId(),
    validarCampos
],deletePublication)

//Mostrar todas las publicaciones del usuario logueado y paginado
route.get('/publication/show-publications',validarJWT,showPublications)

//Mostrar todas las publicaciones de un usuario y paginado
route.get('/publication/show-publications/:id',[
    validarJWT,
    check('id','El id no es un id de Mongo valido').isMongoId(),
    validarCampos
],showPublicationsForUser)

//cargar imagen de la publicacion
route.put('/publication/uploadfile/:id',[
    validarJWT,
    check('id','El id no es un id de Mongo valido').isMongoId(),
    validarCampos,
    validarArchivoSubir
],updateUploadImage)

//Mostrar Imagen de la publicacion por id de publicacion 
route.get('/publication/show-image-publication/:nombreimagen',[
    check('nombreimagen','El nombre de la imagen no debe de estar vacio').notEmpty().trim(),
    validarCampos
],showMediaforName)

//Mostrar las publicaciones de usuarios que sigue el usuario logueado
route.get('/publication/show-publication-following',validarJWT,showPublicationForFollowing)


export default route