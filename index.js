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

// --Token personalizado para morgan que registra el cuerpo de la solicitud
morgan.token('body', (req) => req.bodyContent || '')

// --Configura morgan para usar el token personalizado
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'))

//--Middleware para el manejo de errrores
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
app.use(errorHandler)


//acceder a la ruta /info
const fecha = new Date()
app.get('/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`
        <h1>Agenda retro backend</h1>
        <p>Contactos almacenados actualmente: ${count}</p>
        <p>Hora y fecha actual: ${fecha.toString()}</p>
      `)
    })
    .catch(error => {
      console.error(error)
      response.status(500).json({ error: 'internal server error' })
    })
})
//acceder a la lista de todas las personas
app.get('/api/people', (request, response) => {
  Person.find({/*si queda un objeto vacío busca todo, pero se pueden usar expresiones*/ }).then(contact => {
      console.log(contact)
      response.json(contact)
  })
})





//buscar un recurso específico

app.get('/api/people/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if(person){
      response.json(person)
    }else{
      response.status(404).end()
    }
    
  })
  .catch(error => next(error))
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

  app.delete('/api/people/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

  app.put('/api/people/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })