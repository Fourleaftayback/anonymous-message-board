const mongoose = require('mongoose');


const replies = mongoose.Schema({
  text: String,
  reported: {
    'type': Boolean,
    'default': false
  },
  delete_password: String,
  created_on: {
    'type': Date,
    'default': new Date()
  }
})

const threads = mongoose.Schema({
  text: String,
  delete_password: String,
  reported: {
    'type': Boolean,
    'default': false
  },created_on: {
    'type': Date,
    'default': new Date()
  },
  bumped_on: {
    'type': Date,
    'default': new Date()
  },
  replies: [replies],
  replycount: {
    'type': Number,
    'default': 0
  }
})

const mainBoard = mongoose.Schema({
  board: String,
  threads: [threads],
}, {
  collection: 'messageboard'
})


const mainBoardSchema = mongoose.model('mainBoard', mainBoard);
const threadsSchema = mongoose.model('threads', threads);
const repliesSchema = mongoose.model('replies', replies);

module.exports = {
  MainBoard: mainBoardSchema,
  Thread: threadsSchema,
  Reply: repliesSchema
}