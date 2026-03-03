const express=require('express')
const authRouter=require('./routes/auth.routes')
const acccountRouter=require('./routes/account.routes')
const cookieParser = require('cookie-parser');
const transcationRouter = require('./routes/transcation.routes');
const app=express()

app.use(express.json())
app.use(cookieParser())




app.use('/api/auth',authRouter)
app.use('/api/account',acccountRouter)
app.use('/api/transcation',transcationRouter)




module.exports=app