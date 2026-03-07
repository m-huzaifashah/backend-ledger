const {Router}=require('express');
const { authMiddleware, authSystemUserMiddleware } = require('../middleware/auth.middleware');
const transactionController=require('../controller/transaction.controller')

const transactionRouter=Router();

transactionRouter.post('/',authMiddleware,transactionController.createtransaction)

transactionRouter.post('/system/initial-funds',authSystemUserMiddleware,transactionController.createInitialFundstransaction)

module.exports=transactionRouter

