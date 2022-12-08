const chalk = require("chalk");

/**
 * Coloring console. 
 */
function color(txt = "", color = "") {
  const col = color ? color : "green";
  return chalk.keyword(col)(txt ? txt : "Tidak Ada");
}

module.exports = { color };