const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const getCards = async (req, res, next) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, './cards.json'));
    const cards = JSON.parse(data);
    const playerCards = cards.find(card => card.id === Number(req.params.id));
    if (!playerCards) {
      const err = new Error('Card not found');
      err.status = 404;
      throw err;
    }
    res.json(playerCards);
  } catch (e) {
    next(e);
  }
};

router
  .route('/api/v1/cards/:id')
  .get(getCards);

module.exports = router;