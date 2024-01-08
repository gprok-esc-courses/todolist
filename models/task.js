const mongoose = require('mongoose')

var task = new mongoose.Schema({
    username: String,
    title: String,
    completed: Boolean
}, {collection: 'tasks'})

const Task = mongoose.model('Task', task)

module.exports = Task