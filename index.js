const express = require ('express')
require('dotenv').config({path: './.env'})
const mongoose = require('mongoose')
const app= express()
const PORT = process.env.PORT || 3001
const morgan= require('morgan')
const Person = require('./models/person')



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

//buscar un recurso específico

app.get('/api/people/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})


//crear un nuevo recurso
app.post('/api/people', (request, response) => {
  const body = request.body
 
  if (body.name === undefined || body.name==='') {
    return response.status(400).json({ error: 'content missing' })
  }
  const person = new Person(
    {
      name: body.name,
      number: body.number,
    }
    ) 
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
      console.log('contact saved!')
  })
  
  })


