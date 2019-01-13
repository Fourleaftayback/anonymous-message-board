
'use strict';
const expect = require('chai').expect;
const ThreadMethods = require('../methods/threadmethods.js');
const RepliesMethods = require('../methods/repliesmethods.js');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
   .post((req, res) => {
     ThreadMethods.newThread(req.params.board, req.body.text, req.body.delete_password);
     res.redirect(`/b/${req.params.board}`);
   })
   .put((req, res) => {
     ThreadMethods.reportThread(req.params.board, req.body.thread_id || req.body.report_id)
     .then((data) => {
      res.send(data);
     }).catch((err) => {
       res.send(err);
     });
   })
   .get((req, res) => {
     let board = req.params;
     ThreadMethods.getThreads(board.board)
     .then((data) => res.json(data))
     .catch((err) => {
      res.send(err);
     });
   })
   .delete((req, res) => {
     ThreadMethods.deleteThread(req.params.board, req.body.thread_id,req.body.delete_password)
     .then((data)=> {
       res.send(data);
     }).catch((err) => {
      res.send(err);
    });
   }); 


  app.route('/api/replies/:board')
  .post((req, res) => {
    RepliesMethods.newReply(req.params.board, req.body.thread_id, req.body.text, req.body.delete_password)
    .then(() => {
      if(req.headers.referer === 'http://localhost:3000/') {
      res.redirect(`/b/${req.params.board}`);
      } else {
      res.redirect(req.headers.referer);
      }
    })
    .catch((err) => {
      res.send(err);
    });     
  })
  .put((req, res) => {
    RepliesMethods.reportReply(req.params.board, req.body.thread_id, req.body.reply_id)
    .then((data) => {
      res.send(data);
    })
  })
  .get((req, res) => {
   RepliesMethods.getReplies(req.params.board, req.query.thread_id)
   .then((data) => res.json(data))
   .catch((err) => res.json(err))  
  })
  .delete((req, res) => {
   RepliesMethods.deleteReply(req.params.board, req.body.thread_id, req.body.reply_id, req.body.delete_password)
   .then((data) => {
     res.send(data);
   }).catch((err) => {
     res.send(err);
   }); 
  });
   
};
