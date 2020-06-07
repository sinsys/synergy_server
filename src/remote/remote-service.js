require('dotenv').config();
const { BASE_URL } = require('../config');
const fetch = require('node-fetch');
const RemoteService = {

  headers: {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + process.env.ROYALE_API_KEY,
      'Content-Type': 'application/json'
    }
  },

  getClan: (tag) => {
    let fetchUrl = `${BASE_URL}/clans/%23${tag}`;
    return (
      fetch(fetchUrl, RemoteService.headers)
    );
  },

  getClans: (tags) => {
    let fetchUrls = tags.map(tag => `${BASE_URL}/clans/%23${tag}`);
    return (
      Promise.all(fetchUrls.map(fetchUrl => fetch(fetchUrl, RemoteService.headers)))
    );
  },

  getClanWarlogs: (tag) => {
    let fetchUrl = `${BASE_URL}/clans/%23${tag}/warlog`;
    return (
      fetch(fetchUrl, RemoteService.headers)
    );
  },

  getClansWarlogs: (tags) => {
    let fetchUrls = tags.map(tag => `${BASE_URL}/clans/%23${tag}/warlog`);
    return (
      Promise.all(fetchUrls.map(fetchUrl => fetch(fetchUrl, RemoteService.headers)))
    );
  },

  getCurrentClanWars: (tags) => {
    let fetchUrls = tags.map(tag => `${BASE_URL}/clans/%23${tag}/currentwar`)
    return (
      Promise.all(fetchUrls.map(fetchUrl => fetch(fetchUrl, RemoteService.headers)))
    );
  },

  getCurrentWarlog: (tag) => {
    let fetchUrl = `${BASE_URL}/clans/%23${tag}/currentwar`;
    return (
      fetch(fetchUrl, RemoteService.headers)
    );
  },
  
  getPlayer: (tag) => {
    let fetchUrl = `${BASE_URL}/players/%23${tag}`;
    return (
      fetch(fetchUrl, RemoteService.headers)
    );
  },

  getClanPlayers: (tag) => {
    let fetchUrl = `${BASE_URL}/clans/%23${tag}/members`;
    return (
      fetch(fetchUrl, RemoteService.headers)
    );
  },

  getClansPlayers: (tags) => {
    let fetchUrls = tags.map(tag => `${BASE_URL}/clans/%23${tag}/members`);
    return (
      Promise.all(fetchUrls.map(fetchUrl => fetch(fetchUrl, RemoteService.headers)))
    );
  },

  getCards: () => {
    let fetchUrl = `${BASE_URL}/cards`;
    return (
      fetch(fetchUrl, RemoteService.headers)
    );
  },

  getPlayerBattleLogs: (tag) => {
    let fetchUrl = `${BASE_URL}/players/%23${tag}/battlelog`;
    return (
      fetch(fetchUrl, RemoteService.headers)
    );
  }
}

module.exports = RemoteService;