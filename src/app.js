require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const app = express();
const cardsRouter = require('./cards/cards-router');
const warRouter = require('./war/war-router');

const morganOpt =
  ( NODE_ENV === 'production' )
    ? 'verbose'
    : 'common';

app.use(
  morgan(morganOpt),
  helmet(),
  cors()
);

app.get('/', (req, res) => {
  res.send('Server is up');
});

app.use('/api/cards', cardsRouter);
app.use('/api/war', warRouter);

errorHandler = (err, req, res, next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = { 
      error: { 
        message: 'server error' 
      }
    };
  } else {
    console.error(err);
    response = {
      message: err.message, err
    };
  }
  res.status(500).json(response)
};

app.use(errorHandler);

module.exports = app;