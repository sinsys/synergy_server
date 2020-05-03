require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const fetch = require('node-fetch');
const app = express();

const morganOpt =
  ( NODE_ENV === 'production' )
    ? 'tiny'
    : 'common';

app.use(
  morgan(morganOpt),
  helmet(),
  cors()
);

app.get('/', (req, res) => {
  const baseUrl = "https://api.clashroyale.com/v1";
  const route = "clans";
  const clanTag = "%238URQ0UR8"
  const endpoint = "currentwar";
  console.log(process.env.API_KEY);
  fetch(`${baseUrl}/${route}/${clanTag}/${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.ROYALE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
    .then(fetchRes => fetchRes.json())
    .then(data => {
      res.send(data);
    });

});

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