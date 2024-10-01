import mongoose from 'mongoose'

const dbConecction = async() => {

    try {
        const db = await mongoose.connect(process.env.MONGODB_CONEXION)
        const url = `${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`
        console.log(`Mongo db conectado en ${url}`)
    } catch (error) {
        console.log(error)
        console.log('error de conexion',error.message);
        throw new Error('Error a la hora de iniciar la base de datos')
    }
}


export{
    dbConecction
}