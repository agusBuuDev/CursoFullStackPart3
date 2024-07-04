const express = require ('express')
require('dotenv').config({path: './.env'})
const app= express()
const PORT = process.env.PORT || 3001
const morgan= require('morgan')
const cors = require('cors')



//comenzamos
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    { 
        "id": 5,
        "name": "Juana de Arco", 
        "number": "39-23-6425698"
      }
]

//Middleware area
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Middleware personalizado para almacenar el cuerpo de la solicitud
app.use((req, res, next) => {
  req.bodyContent = JSON.stringify(req.body)
  next()
})

// Token personalizado para morgan que registra el cuerpo de la solicitud
morgan.token('body', (req) => req.bodyContent || '')

// Configura morgan para usar el token personalizado
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'))

//implementamos el GET de la home del servidor
app.get('/', (request, response)=>{
    response.send('<p>backend de mi agenda</p>')
})
//acceder a la lista de todas las personas
app.get('/api/persons', (request, response)=>{
    response.json(persons)
})

//acceder a la ruta /info y ver el toral de recursos junto a la fecha y hora
const fecha= new Date()
app.get('/info', (request, response)=>{
    response.send(`
         <h1>Agenda retro backend</h1>
        <p>contactos almacendados actualmente: ${persons.length}</p>
        <p> Hora y fecha actual: ${fecha.toString()}</p>
        `
       
    )
})

//acceder a 1 persona en concreto
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
      response.json(person)
    } else {
      console.log('x')
      response.status(404).end()
    }
  })

  //eliminar un recurso
  app.delete('/api/persons/:id', (request, response)=>{
    const id = Number(request.params.id)
    const person= persons.filter(person=>person.id===id)
    response.status(204).end()
  } )

 //funciones auxiliares para el metodo post

 const generarID= ()=>Math.floor(Math.random() * 10000)


  //crear un nuevo recurso
  app.post('/api/persons', (request, response) => {
    const body = request.body
  //verifica que el nombre no esté vacío
    if (!body.name) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
    //verifica que el nombre no exista en la agenda
    const existeName= persons.find(person=>person.name===body.name)
    if(existeName){
        return response.status(400).json({ 
            error: 'el contacto ya existe' 
          })
    }

    const existeNumber= persons.find(person=>person.number===body.number)
    if(existeNumber){

        return response.status(400).json({ 
            error: 'el número ya existe' 
          })

    }
  
    const person = {
      name: body.name,
      number: body.number,
      id:generarID()
    }
  
    persons = persons.concat(person)
  
    response.json(person)
  })




