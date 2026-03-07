const express=require('express')
const {authMiddleware}=require('../middleware/auth.middleware')
const accountController=require('../controller/account.controller')
const router=express.Router()

router.post('/',authMiddleware,accountController.createAccountController)
router.get('/',authMiddleware,accountController.getAllAccounts)
router.get('/balance/:accountId',authMiddleware,accountController.getAccountBalance)


module.exports=router