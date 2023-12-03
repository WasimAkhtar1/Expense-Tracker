
var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/usermodel");
const expense = require("../models/expensemodel");
const passport = require("passport");
const category = require('../public/javascripts/category');
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/signin', function(req, res, next) {
  res.render('signin');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

//profile file 
router.get('/profile', async (req, res) => {
  try {
    const user = await req.user.populate('expenses');
    console.log(user);
    res.render('profile.ejs', {
      category: category,
      expenses: user.expenses,
      admin: req.user,
    });
  } catch (error) {
       res.send(error);
  }
})


router.post('/send',async function(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send("User Not Found");
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.resetPasswordOtp = otp;
    await user.save();
    await sendMailhandler(req.body.email, otp, res);
    res.render('otpMathch.ejs', {
      email: req.body.email,
      id: user._id,
      admin: req.user,
    });
  } catch (error) {
    res.send(error);
  }
})
//sendMailHandler Function
async function sendMailhandler(email, otp, res) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: `wasimlakhtar@gmail.com`,
      pass: 'ehzt uvmy qclp awvp',
    },
  });
  // receiver mailing info
  const mailOptions = {
    from: "Wasim Pvt. Ltd.<wasimlakhtar@gmail.com>",
    to: email,
    subject: "OTP Testing Mail Service",
    // text: req.body.message,
    html: `<h1>${otp}</h1>`,
  };
  // actual object which intregrate all info and send mail
  transport.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.send(err)
    }
    // console.log(info);
    return;
  });
}




router.get('/forget', function(req, res, next) {
  res.render('forget');
});
router.post("/signup", async function (req, res, next) {
  try {
      await User.register(
          { username: req.body.username, email: req.body.email },
          req.body.password
      );
      res.redirect("/signin");
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.post(
  "/signin",
  passport.authenticate("local", {
      successRedirect: "/profile",
      failureRedirect: "/signin",
  }),
  function (req, res, next) {}
);


// 
router.post("/match-otp/:id", async function (req, res, next) {
  try {
      const user = await User.findById(req.params.id);
      if (user.resetPasswordOtp == req.body.otp) {
          user.resetPasswordOtp = -1;
          await user.save();
          res.render("newpassword", { admin: req.user, id: user._id });
      } else {
          res.send(
              "Invalid OTP, Try Again <a href='/forget'>Forget Password</a>"
          );
      }
  } catch (error) {
      res.send(error);
  }
});


router.post('/Authenticate/resetpassword/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const newPassword = req.body.password;
    // user.password = newPassword;
    await user.setPassword(newPassword);
    await user.save();
    res.redirect('/signin');
  } catch (error) {
    res.send(error);
  }
})




router.post('/create-expense', async (req, res) => {
  try {
      const Expense = new expense(req.body);
      req.user.expenses.push(Expense._id);
      expense.user = req.user._id;
      // console.log(expense.user);
      // res.json(expense);
      await Expense.save();
      await req.user.save();
      res.redirect("/profile");
  } catch (error) {
      res.send(error);
}
});

router.get('/delete/:id', async (req, res) => {
  try {
    // console.log( req.params.id);
    const expenseIndex = await req.user.expenses.findIndex((exp) => exp.valueOf() === req.params.id);
    // console.log("expenseIndexx "+ expenseIndex);
    req.user.expenses.splice(expenseIndex, 1);
    await req.user.save();
    await expense.findByIdAndDelete(req.params.id);
    res.redirect("/profile");
  } catch (error) {
    res.json(error);
  }
})


router.get('/update/:id', async (req, res) => {
  const Expense = await expense.findById(req.params.id);
  res.render('expenseUpdate.ejs', { admin: req.user, id: req.params.id, expense: Expense,category:category });
})
router.post('/update/:id', async (req, res) => {
  try {
    await expense.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/profile');
  } catch (error) {
    res.send(error);
  }
})



module.exports = router;


