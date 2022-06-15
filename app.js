require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const ejs = require("ejs");
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: "This is a secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(passport.initialize())
app.use(passport.session())

var secrets = ["Thor is my hero"]

mongoose.connect("mongodb://0.0.0.0:27017/secretDB")


const secretSchema = {
  content: String
}

const userSchema  = new mongoose.Schema({
  userName: String,
  password: String
})
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema);
const Secret = mongoose.model("secret", secretSchema);

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.route("/")
 .get((req, res) =>{
   res.render("home")
 })


app.route("/register")
  .get((req, res)=>{
    res.render("register")
  })
  .post((req, res)=>{
    const userName= req.body.userName
    bcrypt.hash(req.body.password, saltRounds, (err, hash)=>{
      const user = new User ({
        userName: userName,
        password: hash
      })
       user.save()
    })
     res.redirect("/")
  })

app.route("/login")
    .get((req, res)=>{
      res.render("login")
    })
    .post((req, res)=>{
      const userName= req.body.userName
      const password = req.body.password
      User.findOne({userName: userName}, (err, foundItem)=>{
         bcrypt.compare(password, foundItem.password, (err, result)=>{
           if(result === true){
              res.redirect("/secrets")
           }else{
            res.redirect("/login")
              }
         })
      })
    })

app.route("/secrets")
  .get((req, res)=>{

     console.log(secrets);
     res.render("secrets",{secrets: secrets})
  })

app.route("/submit")
  .get((req, res)=>{
    res.render("submit")
 })
 .post((req, res)=>{
   const secret = req.body.secret
   const newSecret = new Secret ({
     content: secret
   })
   newSecret.save()

  res.redirect("/secrets")
 })










app.listen(3000)
