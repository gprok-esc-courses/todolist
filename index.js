const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
require('dotenv').config()

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded())
app.use(session({secret: process.env.SECRET}))

let User = require('./models/user')
let Task = require('./models/task')

mongoose.connect('mongodb+srv://todolist:' + process.env.PASSWORD + '@cluster0.jnw32.mongodb.net/todolist')


function getUsername(req) {
    return req.session.username ? req.session.username : ''
}


app.get('/', (req, res) => {
    res.render('pages/home', {'username': getUsername(req)})
})

app.get('/register', (req, res) => {
    res.render('pages/register', {'username': getUsername(req)})
})

app.post('/register', async (req, res) => {
    const user = await User.findOne({'username': req.body.username}).exec()
    if(user != null) {
        res.render('pages/error', {'error': 'Username ' + req.body.username + ' already used', 'username': getUsername(req)})
    }
    else {
        if(req.body.password != req.body.password2) {
            res.render('pages/error', {'error': 'Passwords do not match', 'username': getUsername(req)})
        }
        else {
            User.create({
                username: req.body.username,
                password:  req.body.password
            })
            res.redirect('/login')
        }
    }
})

app.get('/login', (req, res) => {
    res.render('pages/login', {'username': getUsername(req)})
})

app.post('/login', async (req, res) => {
    const user = await User.findOne({'username': req.body.username}).exec()
    if(user != null) {
        if(user.password == req.body.password) {
            req.session.username = req.body.username
            res.redirect('/tasks')
        }
        else {
            res.render('pages/error', {'error': 'Wrong credentials', 'username': getUsername(req)})
        }
    }
    else {
        res.render('pages/error', {'error': 'User not found', 'username': getUsername(req)})
    }
})

app.get('/tasks', async (req, res) => {
    if(req.session.username) {
        let tasks = await Task.find({'username': req.session.username, 'completed': false }).exec()
        res.render('pages/tasks', {'username': req.session.username, 'tasks': tasks})
    }
    else {
        res.redirect('/login')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

app.post('/add/task', async (req, res) => {
    if(req.session.username) {
        await Task.create({
            username: req.session.username,
            title: req.body.task,
            completed: false
        })
        res.redirect('/tasks')
    }
    else {
        res.redirect('/login')
    }
})

app.get('/complete/task/:task_id', async (req, res) => {
    if(req.session.username) {
        let task = await Task.findById(req.params.task_id).exec()
        task.completed = true
        task.save()
        res.redirect('/tasks')
    }
    else {
        res.redirect('/login')
    }
})

app.listen(5001, () => {
    console.log("Server started on port 5001")
})