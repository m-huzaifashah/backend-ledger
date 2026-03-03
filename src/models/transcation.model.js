const mongoose=require('mongoose')


const transcationSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,'Transcation must be associatd with a from account'],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,'Transcation must be associatd with a to account'],
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
        required:[true,'Amont is required to perform a Transcation'],
        min:[0,'Amount can not be negative']
    },
    idempotencyKey:{
        type:String,
        required:[true,'idempotency is required for transcation'],
        index:true,
        unique:true
    }
},{
    timestamps:true
})

const transcationModel=mongoose.model('transcation',transcationSchema)

module.exports=transcationModel