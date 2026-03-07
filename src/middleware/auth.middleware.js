const accountModel = require('../models/accounts.model')
const userModel=require('../models/user.model')
const jwt=require('jsonwebtoken')

async function authMiddleware(req,res,next){

    const token=req.cookies.token||req.headers.authorization?.split(" ")[1]

if(!token){
    return res.status(401).json({
        message:'unauthorized Acess,token is missing'
    })
}
try{
 const decoded=jwt.verify(token,process.env.JWT_SECRET)
 console.log(decoded.id)
const user=await userModel.findById(decoded.id)
req.user=user
next()
}catch(err){
console.log(err)

 res.status(401).json({
        message:'unauthorized Acess,token is missing'
    })
}

}

async function authSystemUserMiddleware(req,res,next) {

    const token=req.cookies.token||req.headers.authorization?.split(" ")[1]

    if(!token){
    return res.status(401).json({
        message:'unauthorized Acess,token is missing'
    })
}

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        
        
        const user=await userModel.findById(decoded.id).select('+systemUser')

        if(!user.systemUser){
            return res.status(403).json({
                message:'Forbidden Access you are not SystemUser!'
            })
        }
        req.user=user
        next()


    } catch (error) {
        console.log(error)
         return res.status(401).json({
        message:'unauthorized Acess,token is invalid'
    })
    }


}
 module.exports={authMiddleware,authSystemUserMiddleware}