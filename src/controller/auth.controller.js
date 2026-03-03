const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService=require('../services/email.service')

async function registerController(req, res) {
  const { email, name, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    email,
  });

  if (isUserAlreadyExists) {
    return res
      .status(422)
      .json({ message: "user already exists with email", status: "failed" });
  }

  const user = await userModel.create({
    email,
    name,
    password,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "user Created successfully",
    status: "success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });

  await emailService.sendRegistrationEmail(user.email,user.name)
}

async function loginController(req, res) {
  const { name, email, password } = req.body;
  const user = await userModel.findOne({
    $or: [{ email }, { name }],
  }).select('+password');

  if (!user) {
    return res.status(422).json({
      message: "no user exists with this email or username",
    });
  }
  const isValidPass = await user.comparePassword(password);
  if (!isValidPass) {
    return res.status(422).json({
      message: "incorrect password",
    });
  }
  const token=jwt.sign({
    id:user._id
  },process.env.JWT_SECRET,{
    expiresIn:"3d"
  })

  res.cookie('token',token)

  res.status(200).json({
    message:'user logined',
     status: "success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  })
}

module.exports = { registerController,loginController };
