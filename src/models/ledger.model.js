const mongoose=require('mongoose')


const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,'Ledger must be associated with an account'],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,'Amount is required for ledger entry'],
        min:[0,'ammount can not be negative'],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'transaction',
        required:[true,'Ledger must be assocaited with a transaction'],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:['DEBIT','CREDIT'],
            message:'Type can either be DEBIT or CREDIT'
        },
        required:[true,'ledger type is required'],
        immutable:true
    }
},{
    timestamps:true
})

function preventLedgerModification(){
    throw new Error('Ledger entries are immutable and can not be modified')
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification)
ledgerSchema.pre('deleteOne',preventLedgerModification)
ledgerSchema.pre('updateOne',preventLedgerModification)
ledgerSchema.pre('remove',preventLedgerModification)
ledgerSchema.pre('deleteMany',preventLedgerModification)
ledgerSchema.pre('updateMany',preventLedgerModification)
ledgerSchema.pre('findOneAndReplace',preventLedgerModification)
ledgerSchema.pre('findOneAndDelete',preventLedgerModification)

const ledgerModel=mongoose.model('ledger',ledgerSchema)

module.exports=ledgerModel