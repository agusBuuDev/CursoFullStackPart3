const express = require ('express')
require('dotenv').config({path: './.env'})
const mongoose = require('mongoose')
const app= express()
const PORT = process.env.PORT || 3001
const morgan= require('morgan')
const cors = require('cors')
const fs = require('fs');
const path = require('path');

//conexión a mongo db
const password = process.env.DB_MONGO_PASS
const name= process.argv[2] //argumentos para cargar datos por consola
const number= process.argv[3]


const url =`mongodb+srv://agusbuu:${password}@agusbuutest.vwagzp6.mongodb.net/agendaRetro?retryWrites=true&w=majority&appName=AgusBuuTest`
mongoose.set('strictQuery',false)
mongoose.connect(url)
console.log('conexion existosa')

//creación del esquema de cada documento mongo
  
const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

const Person = mongoose.model('Person', personSchema)




//Definición del puerto donde va a trabajar el backend
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})



//Middleware area
//app.use(cors()) //permite comunicación entre frontend y backend con distintas IP. ya no es necesario porque esta todo junto
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('dist')) //levanta la dist de frontend de la carpeta dist

// Middleware personalizado para almacenar el cuerpo de la solicitud
app.use((req, res, next) => {
  req.bodyContent = JSON.stringify(req.body)
  next()
})

// Token personalizado para morgan que registra el cuerpo de la solicitud
morgan.token('body', (req) => req.bodyContent || '')

// Configura morgan para usar el token personalizado
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'))


//acceder a la lista de todas las personas
app.get('/api/people', (request, response) => {
  Person.find({/*si queda un objeto vacío busca todo, pero se pueden usar expresiones*/ }).then(contact => {
      console.log(contact)
      response.json(contact)
  })
})

//crear un nuevo recurso
app.post('/api/people', (request, response) => {
  const body = request.body
   
  const person = new Person(
    {
      name: body.name,
      number: body.number,
    }
    ) 
  
    person.save().then(result => {
      console.log('contact saved!')
  })
  
  })


