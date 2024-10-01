import { verifyAndCreateFolder } from './verifyFileAndCreate.js'
import { v4 as uuidv4 } from 'uuid'

const subirArchivo = (files, extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'], carpeta='') => {
    return new Promise((resolve, reject) => {

        const { archivo } = files
        const nombreCortado = archivo.name.split('.')
        const extension = nombreCortado[nombreCortado.length - 1]

        //validar la extension
        if (!extensionesValidas.includes(extension)) {
            return reject(`La extension ${extension} no es valida`)
        }

        const nombreTemp = uuidv4() + '.' + extension
        const baseDir = `uploads/${carpeta.trim()}`;
        verifyAndCreateFolder(baseDir);//verifica si existe la ruta si no la crea
        archivo.mv(`${baseDir}/${nombreTemp}`, (err) => {
            if (err) return reject(err);

            return resolve(nombreTemp);
        });

    })

}

export {
    subirArchivo
}