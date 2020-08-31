var express = require('express'); 
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const cors = require('cors');
 
// Nous définissons ici les paramètres du serveur.
var hostname = '51.210.180.207'; 
var port = 3000; 
 
var app = express(); 
app.use(cors());
 
let db = new sqlite3.Database('../Discord/Panini/paniniCards.db', (err) => {
  if (err) {      
      return console.error(err.message);
  }
});

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router();
const getCards = async (req, res, next) => {
  try {
    //const data = fs.readFileSync(path.join(__dirname, './cards.json'));
    var cards;

    db.all("SELECT * from paniniCards where collectionId <> 0 order by id asc", (err, data) => {
      if(err){
        console.log("error");
      }
      cards = data;
      res.json(cards);
    });

    
  } catch (e) {
    next(e);
  }
};

const getCardById = async (req, res, next) => {
  let cardId = req.params.id;
  try {
    var card;

    db.get("SELECT * from paniniCards where id = " + cardId, (err, data) => {
      if(err){
        console.log("error");
      }
      card = data;
      res.json(card);
    });

    
  } catch (e) {
    next(e);
  }
}

const getCollections = async (req, res, next) => {
  try {
    var collections;

    db.all("SELECT distinct(collection), collectionId from paniniCards", (err, data) => {
      if(err){
        console.log("error");
      }
      collection = data;
      res.json(collection);
    });

    
  } catch (e) {
    next(e);
  }
}

const getPlayerCards = async (req, res, next) => {
  let playerId = req.params.playerId;
  try {
    var playerCards;

    var query = "SELECT pc.name, pc.src from playerCards p left join paniniCards pc on p.cardId = pc.id " +
                "left join players pl on p.playerId = pl.id " +
                "where p.playerId like '%" + playerId + "%' order by pc.id asc";

    db.all(query , (err, data) => {
      if(err){
        console.log("error");
      }
      playerCards = data;
      res.json(playerCards);
    });

    
  } catch (e) {
    next(e);
  }
}

const getPlayerCardsByCollection = async (req, res, next) => {
  let playerId = req.params.playerId;
  let collectionId = req.params.collectionId;
  
  try {
    var playerCards;

    var query = "SELECT * from playerCards p left join paniniCards pc on p.cardId = pc.id " +
                "left join players pl on p.playerId = pl.id " +
                "where p.playerId like '%" + playerId + "%' " +
                "and pc.collectionId = " + collectionId;

    db.all(query , (err, data) => {
      if(err){
        console.log("error");
      }
      playerCards = data;
      res.json(playerCards);
    });

    
  } catch (e) {
    next(e);
  }
}

const getPlayers = async (req, res, next) => {
  var players;
  try {
    var query = "select * from players p";
    db.all(query, (err, data) => {
      console.log(data);
      players = data;
      res.json(players);
    });
  } catch (e) {
    next(e);
  }
}

const getDoublesOfPlayer = async (req, res, next) => {
  let playerId = req.params.playerId;
  try {
    var doubles;

    var query = "SELECT * from playerCards where cardQuantity > 1 and playerId like '%" + playerId + "%'";

    db.all(query , (err, data) => {
      if(err){
        console.log("error");
      }
      doubles = data;
      res.json(doubles);
    });

    
  } catch (e) {
    next(e);
  }
}
 
myRouter.route('/players')
.get(getPlayers);

myRouter.route('/cards')
.get(getCards);

myRouter.route('/cards/:id')
.get(getCardById);

myRouter.route('/collections')
.get(getCollections);

myRouter.route('/:playerId')
.get(getPlayerCards);

myRouter.route('/:playerId/doubles')
.get(getDoublesOfPlayer);

myRouter.route('/:playerId/:collectionId')
.get(getPlayerCardsByCollection);


app.use(myRouter);

// Démarrer le serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port+"\n"); 
});