import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';

const router = express.Router();

// for sign up registration
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "User already exists" });
  }

  // Hash the password
  const hashPassword = await bcrypt.hash(password, 10);

  // Create new user and save it
  const newUser = new User({
    username,
    email,
    password: hashPassword,
  });

  await newUser.save();
  return res.json({ status: true, message: "Record registered" });
});

// for log-in 
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User is not registered" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.json({ message: "Password is incorrect" });
  }

  const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
  return res.json({ status: true, message: "Login Successfully" });
});

// for reset password
router.post("/forget-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not registered" });
    }

    // Generate token for resetting password
    const token = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: "5m" });

    // Nodemailer configuration
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rajeshkumarkrr10@gmail.com',
        pass: 'ioql qcla ojvd yxgh'
      }
    });

    var mailOptions = {
      from: 'rajeshkumarkrr10@gmail.com',
      to: email,
      subject: 'Reset Password',
      text: `http://localhost:3000/resetpassword/${token}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: "Error sending email" });
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// for new password

router.post("/reset-password/:token", async (req,res) =>
{
    const {token} = req.params;
    const {password} = req.body;

    try
    {
        const decoded = await jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        const hashPassword = await bcrypt.hash(password, 10)
        await User.findByIdAndUpdate({_id: id},{password: hashPassword})
        return res.json({status: true, message: "update password"})
    }
    catch(err)
    {
        return res.json("invalid token")
    }
})


// verify the authorise

const verifyUser = async (req, res, next) =>
  {
    try
    {
       const token = req.cookies.token;
       if(!token)
       {
        return res.json({status: false, message: "no token"})
       }
  
       const decoded = await jwt.verify(token, process.env.KEY)
       next()
  
    }
    catch (err)
    {
     return res.json(err)
    }
  }

router.get("/verify", verifyUser, (req,res) =>
{  
  return res.json({status: true , message: "authorized"})
})


// logout

router.get("/logout", (req,res) =>
{
  res.clearCookie("token");
  return res.json({status: true})
})


export { router as UserRouter };
