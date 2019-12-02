const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const user = require("./routes/user")
const mongoose = require('mongoose')
const session = require ("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const path = require("path")
require("./config/auth")(passport)
const db = require("./config/db")

//SESSÃO
app.use(session({
    secret: "qualquercoisa",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//MIDDLEWARE
app.use((req,res,next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

//BODY PARSER
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//HANDLEBARS
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');

//MONGOOSE
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI).then(() => {
console.log("Conectado ao mongo")
}).catch((err) => {
    console.log("Erro: "+err)
})

//PUBLIC
app.use(express.static(path.join(__dirname,"public")))

//ROTAS
app.use('/user', user)
app.get("/", (req,res) => {
    res.redirect("user/login")
})


//PORTA
const PORT = process.env.PORT || 8081
app.listen(PORT)