/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const generateStr = (length) => {
  const text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

suite('Functional Tests', function() {
  let testBoard = 'fcctest';
  let password = '777';
  let testId, testIdTwo, testIdThree;
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create new threads one gets deleted below', function(done) {
        chai.request(server)
          .post(`/api/threads/${testBoard}`)
          .send({text: generateStr(8), delete_password: password})
          .end((err, res) => {
            assert.equal(res.status, 200);
          });
        chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({text: generateStr(8), delete_password: password})
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });  
      });
    });
    
    suite('GET', function() {
      test('retrieve board with max 10 threads and max 3 replies', function(done) {
        chai.request(server)
          .get(`/api/threads/${testBoard}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isObject(res.body[0]);
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'replycount');
            assert.property(res.body[0], 'replies');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'text');
            assert.isArray(res.body[0].replies[0]);
            assert.property(res.body[0].replies[0], 'created_on');
            assert.property(res.body[0].replies[0], '_id');
            assert.property(res.body[0].replies[0], 'text');
            assert.isBelow(res.body.length, 11);
            assert.isBelow(res.body[0].replies.length, 4);
            testId = res.body[0]._id;
            testIdTwo = res.body[1]._id;
            done();
          });
      });
    });
    
    suite('DELETE', function() {
      test('delete board', function(done) {
        chai.request(server)
         .delete(`/api/threads/${testBoard}`)
         .send({thread_id: testId, delete_password: password})
         .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
         });  
      });
      test('delete board', function(done) {
        chai.request(server)
         .delete(`/api/threads/${testBoard}`)
         .send({thread_id: testIdTwo, delete_password: 'sadfkla'})
         .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
         });  
      });
    });
    
    suite('PUT', function() {
      test('report a thread', function(done) {
        chai.request(server)
          .put(`/api/threads/${testBoard}`)
          .send({thread_id: testIdTwo, delete_password: password})
          .end((err, res) => {
           assert.equal(res.status, 200);
           assert.equal(res.text, 'success');
          done();
          });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('create new reply', function(done) {
        chai.request(server)
          .post(`/api/replies/${testBoard}`)
          .send({thread_id: testIdTwo, text: generateStr(8), delete_password: password})
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          }); 
      });
    });
    
    suite('GET', function() {
      test('get replies', function(done) {
        chai.request(server)
         .get(`/api/replies/${testBoard}`)
         .query({thread_id: testId2})
         .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'replycount');
          assert.property(res.body, 'replies');
          assert.property(res.body, '_id');
          assert.property(res.body, 'text');
          assert.equal(res.body._id, testIdTwo);
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          assert.isArray(res.body.replies);
          testIdThree = res.body.replies[0]._id;
          done();
         });
      });
    });
    
    suite('PUT', function() {
      test('report a reply', function(done) {
        chai.request(server)
         .putt(`/api/replies/${testBoard}`)
         .send({thread_id: testId2, reply_id: testIdThree})
         .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
         });
      });
    });
    
    suite('DELETE', function() {
      test('delete reply', function(done) {
        chai.request(server)
         .delete(`/api/replies/${testBoard}`)
         .send({thread_id: testId, reply_id: testIdThree ,delete_password: password})
         .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
         });  
      });
      test('delete reply bad', function(done) {
        chai.request(server)
         .delete(`/api/replies/${testBoard}`)
         .send({thread_id: testIdTwo, reply_id: testIdThree ,delete_password: 'sadfkla'})
         .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
         });  
      });
    });
    
  });

});
