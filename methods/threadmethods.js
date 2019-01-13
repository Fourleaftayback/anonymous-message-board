const ObjectId = require('mongodb').ObjectID;
const { MainBoard } = require('../models/schemas');
const { Thread } = require('../models/schemas');
const misc = require('./miscFunctions');

function newThread(board_name, textInput, password) {
  let boardName = misc.trimMe(board_name);
  MainBoard.findOneAndUpdate({
    board: boardName
  }, {
    new: true
  }, (err, doc) => {
    if(err) console.log(err);
    let thread = new Thread({
      text: textInput,
      delete_password: password
    });
    if (doc == null) {
      let board = new MainBoard({
        board: boardName,
        threads: [thread]
      })
      board.save();
    } else {
      doc.threads.push(thread);
      doc.save();
    }
  });
}

const getThreads = (input) => {
  
  return new Promise((resolve, reject) => {
    MainBoard.findOne({
      board: input
    }, (err, doc) => {
      if (err) throw err;
      if (doc !== null) {
        let arr = doc.threads.sort((a, b) => {
          return +new Date(b.bumped_on) - +new Date(a.bumped_on);
        })
        .slice(0, 10)
      arr.forEach((item) => {
        item.reported = undefined;
        item.delete_password = undefined;
        item.replies.sort((a, b) => {
          return +new Date(b.created_on) - +new Date(a.created_on)
        }).splice(3);
        item.replies.forEach((val) => {
          val.delete_password = undefined;
          val.reported = undefined;
        })
      })
      resolve(arr);
      } else {
        reject('The Board does not exist');   
      }
    });
  }); 
} 

const deleteThread = (board_name, threadId , password) => {
  return new Promise((resolve, reject) => {  
    MainBoard.findOneAndUpdate({board: board_name}, {new: true}, (err, doc) => {
      if(err) throw err;
      if(doc !== null) {
        let subDoc = doc.threads.id(ObjectId(threadId));
        if(subDoc === null || subDoc.delete_password !== password) {
          resolve('incorrect password'); 
        } else {
          doc.threads.pull({_id:ObjectId(threadId)});
          doc.save();
          resolve('success');
        }  
      } else {
        reject("The Board does not exist");   
      }
    });
  });
}

const reportThread = (board_name, threadId) => {
  let boardName = misc.trimMe(board_name);
  return new Promise((resolve, reject) => {
    MainBoard.findOne({board: boardName}, (err, doc) => {
      if(err) throw 'Something went wrong' + err;
      let subDoc = doc.threads.id(ObjectId(threadId));
      subDoc.set({reported: true});
      doc.save();
      resolve('success');
    });
  });
}

exports.newThread = newThread;
exports.getThreads = getThreads;
exports.deleteThread = deleteThread;
exports.reportThread = reportThread;