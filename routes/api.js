/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect        = require('chai').expect;
const StockHandler  = require('../controllers/stockHandler');

module.exports = function (app) {
  
  const stockHandler = new StockHandler();
  
  app.route('/api/stock-prices')
    .get(function (req, res) {
      const db = req.app.locals.db; //mongo db
      const collection = req.app.locals.collection; //mongo db collection
    
      let stock = req.query.stock;
      let likes = req.query.like || false;
      let ip    = req.ip;
      let moreThanOne = Array.isArray(stock) || false;
      
      
    
      //if two stocks and like exists, retreive array of two stocks data
      if(moreThanOne || likes) {
        let firstStk = stock[0].toUpperCase();
        let secondStk = stock[1].toUpperCase();
        stockHandler.stockData(firstStk, collection, likes, ip).then((data1, err) => {
          if(typeof data1 === 'string') { 
            res.send('Our standard API call frequency is 5 calls per minute and 500 calls per day.')
          } else {
            if(data1) {
              let stock1 = data1;
              stockHandler.stockData(secondStk, collection, likes, ip).then((data2, err) => {
                if(typeof data2 === 'string') { 
                  res.send('Our standard API call frequency is 5 calls per minute and 500 calls per day.')
                } else {
                  if(data2) {
                    let stock2 = data2;
                    let stockData = [
                      {
                        stock: stock1.stock,
                        price: stock1.price,
                        rel_likes: stockHandler.relLikes(stock1, stock2)
                      },
                      {
                        stock: stock2.stock,
                        price: stock2.price,
                        rel_likes: stockHandler.relLikes(stock2, stock1)
                      }
                    ];
                    res.json({stockData});
                  }
                }
              });
            }
          }
        });
      //else if one stock, retreive stock data
      } else {
        stock = stock.toUpperCase();
        stockHandler.stockData(stock, collection, likes, ip).then((data) => {
          if(typeof data === 'string') {
            res.send('Our standard API call frequency is 5 calls per minute and 500 calls per day.')
          }
          res.json({stockData: data});
        }).catch(err => console.log(err));
      }
    


    });
};
