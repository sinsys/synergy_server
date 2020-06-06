require('dotenv').config();

// Configuration
const express = require('express');
const { NODE_ENV } = require('./config');

// Middlewar
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

// Routers
const cardsRouter = require('./cards/cards-router');
const warRouter = require('./war/war-router');
const playerRouter = require('./players/player-router');
const clanRouter = require('./clan/clan-router');
const remoteRouter = require('./remote/remote-router');
const warDeckRouter = require('./war/war-deck-router');

const app = express();

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
app.use('/api/wars', warRouter);
app.use('/api/players', playerRouter);
app.use('/api/clans', clanRouter);
app.use('/api/remote', remoteRouter);
app.use('/api/wardecks', warDeckRouter);

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