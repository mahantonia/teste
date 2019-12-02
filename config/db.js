if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://1806910:92254957@cluster0-wm6ls.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/cadusers"}
}