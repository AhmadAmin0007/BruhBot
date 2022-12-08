const fetch = require("node-fetch");
const { writeFileSync, readFileSync } = require("fs");
const axios = require("axios");

function fetchJson(url = "", options) {
  return new Promise(async (resolve, reject) => {
    fetch(url, options)
      .then(response => response.json())
      .then(json => {
        resolve(json);
      })
      .catch((err) => {
        reject("Error");
      });
  });
}

function getGroupAdmin(participants) {
  let admins = [];
  for (let i of participants) {
    i.admin !== null ? admins.push(i.id) : '';
  }
  return admins;
}

function em(text = "") {
  return text.trim().length === 0;
}

function runtime(seconds = 0) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " d, " : " d, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " h, " : " h, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " m, " : " m, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " s" : " s") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function fswrite(file = "", value, space = 2) { return writeFileSync(file, JSON.stringify(value, null, space)); }

async function getBuffer(url, options) {
  try {
    options ? options : {};
    const res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (e) {
    console.log(`Error : ${e}`);
  }
}

module.exports = { fetchJson, getGroupAdmin, em, runtime, fswrite, getBuffer };