const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const {verifica} = require("../helpers/verifica")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

router.get("/registro", (req,res) =>{
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) => {
    //Verifica se o preenchimento do formulário está OK
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"})
    }

    if(req.body.senha.length < 6){
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes"})
    }


    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})

    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com esse e-mail")
                res.redirect("/user/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                //hash na senha
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) =>{
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento")
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() =>{
                            req.flash("success_msg", "Usuário cadastrado com sucesso!")
                            req.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao cadastrar o usuário!")
                            res.redirect("/")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", (req,res) => {
    res.render("usuarios/login")
})

router.post("/login", (req,res,next) => {

    passport.authenticate("local", {
        successRedirect: "/user/home",
        failureRedirect: "/user/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/home", verifica, (req,res) => {

    Postagem.find().sort({data:"desc"}).then((postagens) => {
        res.render("usuarios/home", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagem")
        req.redirect("/user/home")
    })
})

router.post("/home", (req,res) => {
    const novaPostagem = {
        conteudo: req.body.conteudo
    }

    new Postagem(novaPostagem).save().then(() => {
        req.flash("success_msg", "Conteúdo postado!")
        res.redirect("/user/home")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao enviar a postagem")
        res.redirect("/user/home")
    })
})

router.get("/logout", verifica, (req,res) => {
    req.logout()
    res.redirect("/user/login")
})


module.exports = router