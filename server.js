import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/post-codealong'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Task = mongoose.model('Task', {
  text: {
    type: String,
    required: true,
    minlength: 5,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: 'desc' }).limit(20).exec()
  res.json(tasks)
})

app.post('/tasks', async (req, res) => {
  // Retrieve the information sent by the client to our API endpoint
  const { text, complete } = req.body

  // Use our mongoose model to create the database entry
  const task = new Task({ text, complete })

  try {
    // Success
    const savedTask = await task.save()
    res.status(200).json(savedTask) // or status 201: the request has succeeded and has led to the creation of a resource
  } catch (err) {
    // Fail
    res.status(404).json({
      message: 'Could not save task to the Database',
      error: err.errors,
    })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
