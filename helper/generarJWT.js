import jwt from 'jsonwebtoken';

const generarJWT = (id) => {
    return jwt.sign({ uid: id }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

export default generarJWT;