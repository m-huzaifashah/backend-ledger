const mongoose= require ('mongoose')


const connectDb=async()=>{
    try{
await mongoose.connect(process.env.MONGO_URI)
console.log("DB connected")
    }catch(err){
    console.log('Error connecting to Db ',err)
    process.exit(1)
}
}

module.exports=connectDb