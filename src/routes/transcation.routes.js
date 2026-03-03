const {Router}=require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const createTranscation=require('../controller/transcation.controller')

const transcationRouter=Router();

transcationRouter.post('/',authMiddleware,createTranscation)



module.exports=transcationRouter

