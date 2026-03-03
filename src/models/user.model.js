const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is required"],
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "invalid email",
    ],
    unique: [true, "email already exists"],
  },
  name: {
    type: String,
    required: [true, "name is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [6, "password length should be more than 6 "],
    select: false,
  },
},{
    timestamps:true
});

userSchema.pre('save',async function(){
if(!this.isModified('password'))
{
    return 
}

const hash=await bcrypt.hash(this.password,10)
console.log(hash)
this.password=hash
return 
} )

userSchema.methods.comparePassword=async function(password){
  console.log(password,this.password)
return bcrypt.compare(password,this.password)
}

const userModel=mongoose.model('user',userSchema)

module.exports=userModel