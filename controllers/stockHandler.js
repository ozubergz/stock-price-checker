const MongoClient = require('mongodb');
const fetch       = require('node-fetch');

const ROOT_URL = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE'
const API_KEY  = 'JNPI5S230KNVD27Q';

function StockHandler() {
  
  //call and fetch api data
  this.fetchStock = async function(stock) { 
    let url = `${ROOT_URL}&symbol=${stock}&apikey=${API_KEY}`;
    let response = await fetch(url);
    let data = await response.json();
    // console.log(data)
    if(data.Note) { 
      return 'Our standard API call frequency is 5 calls per minute and 500 calls per day.'
    } else {
      if(data) {
        // console.log(data)
        let stock = data['Global Quote']['01. symbol'],
            price = data['Global Quote']['03. high']
            price = parseFloat(price).toFixed(2);
        return { stock, price };
      }
    }
  }
  
  //save stock and likes
  this.saveLikes = async function(stock, collection, likes, ip) {
    //if like is true find and update, or create new stocks and likes to db
    if(likes) {
      let response = await collection.findOneAndUpdate(
        {stock},
        {$addToSet: {likes: ip}},
        {upsert: true, returnNewDocument: true});
      //console.log(response)
      if(response) {
        stock = response.value === null ? stock : response.value.stock;
        likes = response.value === null ? 1 : response.value.likes.length
        return {stock, likes}
      }
    // if like is false, find stock and retrieve likes prop, 
    // or if stock is not found, retreive likes prop with zero
    } else {
      let response = await collection.findOne({stock});
      if(response) {
        stock = response.stock;
        likes = response.likes.length;
        return {stock, likes}
      } else {
        likes = 0;
        return {stock, likes}
      }
    }
  }
  
  this.relLikes = function(stock1, stock2) {
    let difference = stock1.likes - stock2.likes;
    return difference;
  }
  
  //retreive stock's data
  this.stockData = async function(stock, collection, likes, ip) {
    let stock_data = await this.fetchStock(stock).catch(err => console.log(err));
    if(typeof stock_data === 'string') { 
      return 'Our standard API call frequency is 5 calls per minute and 500 calls per day.'
    } else {
      if(stock_data) {
        let data = await this.saveLikes(stock, collection, likes, ip);
        if(data) {
          return {
            stock: stock_data.stock,
            price: stock_data.price,
            likes: data.likes
          }
        }
      }
    }
  }.bind(this)
  
}

module.exports = StockHandler;
