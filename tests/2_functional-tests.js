/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG', 'should retreive stock name');
          assert.property(res.body.stockData, 'price', 'Stock should have _id property');
          assert.property(res.body.stockData, 'likes', 'Stock should have likes property');
          done();
        });
      });
      
      let likes;
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog', likes: true})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.equal(res.body.stockData.likes, 1);
            assert.property(res.body.stockData, 'price');
            likes = res.body.stockData.likes;
            done();
          });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog', likes: true})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.equal(res.body.stockData.likes, likes);
            assert.property(res.body.stockData, 'price');
            done();
          });
      });
      
      let rel_likes;
      
      test('2 stocks', function(done) {
         chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['goog', 'msft']})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.property(res.body.stockData[1], 'price');
            assert.equal(res.body.stockData[0].rel_likes - res.body.stockData[1].rel_likes, 0);
            rel_likes = res.body.stockData[0].rel_likes;
            done();
          });
      });
      
      test('2 stocks with like', function(done) {
         chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['goog', 'msft'], likes: true})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.property(res.body.stockData[1], 'price');
            assert.equal(res.body.stockData[0].rel_likes - res.body.stockData[1].rel_likes, 0);
            assert.equal(res.body.stockData[0].rel_likes, rel_likes);
            done();
          });
      });
      
    });

});
