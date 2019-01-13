const ObjectId = require('mongodb').ObjectID;
const { MainBoard } = require('../models/schemas');
const misc = require('./miscFunctions');

function newReply(board_name, threadId ,replyText, password) {
  let boardName = misc.trimMe(board_name);
  return new Promise((resolve, reject) => {
    MainBoard.findOneAndUpdate({board: boardName}, {new: true}, (err, doc) => {
      if(err) throw err;
      if(doc !== null) {
        let subDoc = doc.threads.id(ObjectId(threadId));
        let reply = {text: replyText, delete_password: password};
         subDoc.replies.push(reply);
         subDoc.set({bumped_on: new Date()});
         subDoc.replycount = subDoc.replycount += 1;
         doc.save();
         resolve();
      } else {
        reject('The Board or Thread does not Exist');  
      }       
    });
  });  
}

const getReplies = (board_name, thread_id) => {
  return new Promise((resolve, reject) => {
    MainBoard.findOne({board: board_name},(err, doc) => {
      if(err) throw err;
      if(doc !== null) {
        let subDoc = doc.threads.id(ObjectId(thread_id));
        subDoc.reported = undefined;
        subDoc.delete_password = undefined;
        subDoc.replies.forEach((item) => {
          item.reported = undefined;
          item.delete_password = undefined;
        })
        subDoc.replies.sort((a, b) => {
          return +new Date(b.created_on) - +new Date(a.created_on);
        })
        resolve(subDoc);
      } else {
        reject("The Board does not exist");  
      }        
    });
  });
}

const deleteReply = (boardName, threadId, replyId, password ) => {
  return new Promise((resolve, reject) => {
    MainBoard.findOne({ board: boardName }, (err, doc) => {
     if(err) throw err;
     if(doc !== null) {
      let subDoc = doc.threads.id(ObjectId(threadId))
      let grandDoc = subDoc.replies.id(ObjectId(replyId));
      if(grandDoc.delete_password === password) {
        grandDoc.set({text: "[deleted]"});
        doc.save((err, data) => {
         if(err) console.log(err);
         resolve('Success');
       });
      } else {
        resolve('incorrect password');
      } 
     } else {
       reject('Thread does not Exist');
     }         
    });
  }); 
}

const reportReply = (board_name, threadId, replyId) => {
  let boardName = misc.trimMe(board_name);
  return new Promise((resolve, reject) => {
    MainBoard.findOne({ board: boardName }, (err, doc) => {
      let subDoc = doc.threads.id(ObjectId(threadId))
      let grandDoc = subDoc.replies.id(ObjectId(replyId));
      grandDoc.set({reported: true});
      doc.save();
      resolve('success');    
     });
  }); 
}

exports.newReply = newReply;
exports.getReplies = getReplies;
exports.deleteReply = deleteReply;
exports.reportReply = reportReply;
