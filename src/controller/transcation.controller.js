const { default: mongoose } = require("mongoose")
const accountModel = require("../models/accounts.model")
const transcationModel = require("../models/transcation.model")
const emailService=require('../services/email.service')

async function createTranscation(req,res) {

    const{fromAccount,toAccount,amount,idempotencyKey}=req.body

    if(!fromAccount||!toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
            message:'all feilds are required'
        })
    }
    
    const fromUserAccount=await accountModel.findById(fromAccount)
    const toUserAccount=await accountModel.findById(toAccount)

    if(!fromUserAccount||!toUserAccount){
        return res.status(400).json({
            message:'to or from Account does not exists'
        })
    }
// to check if a transaction has already been done or not with same idempotency key

    const isTranscationAlreadyExists=await transcationModel.findOne(idempotencyKey)


    if(isTranscationAlreadyExists){
      if(isTranscationAlreadyExists.status=='COMPLETD'){
        return res.status(200).json({
            message:'transcation completed',
            transcation:isTranscationAlreadyExists
        })
      }

      if(isTranscationAlreadyExists.status=='PENDING'){
        return res.status(200).json({
            message:'transcation is still processing',
        })
      }

      if(isTranscationAlreadyExists.status=='FAILED'){
        return res.status(500).json({
            message:'transcation process failed plz try again',
        })
      }

      if(isTranscationAlreadyExists.status=='REVERSED'){
        return res.status(200).json({
            message:'transcation reversed',
        })
      }
    }

    //check if to or from account is Active or Not
    if(fromAccount.status !=='ACTIVE'||toUserAccount.status !=='ACTIVE'){
        return res.status(400).json({
            message:'fromAccount and ToAccount must be active to perform a transcation'
        })
    }

    // Derive Sender balance from ledger

    const balance=await fromUserAccount.getBalance()

    if(balance<amount){
        return res.status(409).json({
            message:`your balance is ${balance} but you are requesting ${amount} which is insufficent`
        })
    }

    // create transcation(PENDING)

    const session=await mongoose.startSession()

    session.startTransaction()

    const transcation=await transcationModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    })

    const debitLedgerEntry=await ledgerModel.create({
        account:fromAccount,
        amount:amount,
        transcation:transcation._id,
        type:'DEBIT'

    },{session})

const creditLedgerEntry=await ledgerModel.create({
        account:toAccount,
        amount:amount,
        transcation:transcation._id,
        type:'CREDIT'

    },{session})
transcation.status==="COMPLETED"

await transcation.save({session})

await session.commitTransaction()
session.endSession()

if(transcation.status!=='COMPLETED'){
await emailService.sendTranscationFaliureEmail(req.user.email,req.user.name,amount,toAccount)

 return res.status(400).json({
    message:'transcation Not completed '
})
}
await emailService.sendTranscationEmail(req.user.email,req.user.name,amount,toAccount)
 res.status(200).json({
    message:'transcation completed successfully'
 })


}

module.exports=createTranscation