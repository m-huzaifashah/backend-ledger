const accountModel = require("../models/accounts.model")


async function createAccountController (req,res){
const user=req.user


const account =await accountModel.create({
    user:user.id,

})

res.status(200).json({
    account
})

}

async function getAllAccounts(req,res){
    const userAccount=await accountModel.find({user:req.user._id})

    if(!userAccount){
        return res.status(404).json({
            message:'account not found'
        })
    }
    res.status(200).json({
        message:'account found',
        userAccount
    })
}

async function getAccountBalance(req,res) {

    const {accountId}=req.params
    const account =await accountModel.findOne({
        _id:accountId,
        user:req.user._id,

    })
    if(!account){
        return res.status(404).json({
            message:'account not found'
        })
    }
    const balance =await account.getBalance()

    res.status(200).json({
        message:'balance fetched',
        balance:balance
    })
}
module.exports={createAccountController,getAllAccounts,getAccountBalance}