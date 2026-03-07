const mongoose=require('mongoose')


const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,'transaction must be associatd with a from account'],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,'transaction must be associatd with a to account'],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:['COMPLETED','REVERSED',"PENDING","FAILED"],
            message:'status can either be COMPLETED,REVERSED,PENDING or FAILED '
        },
        default:'PENDING'
    },
    amount:{
        type:Number,
        required:[true,'Amont is required to perform a transaction'],
        min:[0,'Amount can not be negative']
    },
    idempotencyKey:{
        type:String,
        required:[true,'idempotency is required for transaction'],
        index:true,
        unique:true
    }
},{
    timestamps:true
})

const transactionModel=mongoose.model('transaction',transactionSchema)

module.exports=transactionModel