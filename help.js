function menu(sender, statuss, info, waktu, botName, owner, prefix, iniPrefix, uptime, user) {
  const obj = {
    menu: [
      {
        name: "INFO USER",
        list: [
          `Hi, @${sender}`,
          `Status: *${statuss}*`,
          `Waktu: *${waktu}* WIB`
        ]
      },
      {
        name: "INFO BOT",
        list: [
          `Bot: ${botName}`,
          `Owner: ${owner}`,
          `Prefix: *${iniPrefix}*`,
          `Uptime: ${uptime}`,
          `User: ${user}`
        ]
      },
      {
        name: "MAIN MENU",
        list: [
          "owner",
          "rules",
          "donasi"
        ]
      },
      {
        name: "OWNER MENU",
        list: [
          "addprem <mentions/number>",
          "delprem <mentions/number>",
          "uptime",
          "set <options>"
        ]
      },
      {
        name: "GROUP MENU",
        list: [
          "promote <mentions/number>",
          "demote <mentions/number>",
          "add <number>",
          "kick <mentions/number>",
          "linkgroup",
          "hidetag <text>",
          "tagall",
          "group <options>",
          "join <link>"
        ]
      },
      {
        name: "ISLAMIC MENU",
        list: [
          "surah <surah>",
          "jadwalsholat <kota>"
        ]
      },
      {
        name: "STALKER MENU",
        list: [
          "github <username>",
          "servermcjava <ip:port>",
          "twitter <username>",
          "tiktok <username>",
          "ig <username>"
        ]
      },
      {
        name: "SEARCH MENU",
        list: [
          "brainly <query>",
          "pinterest <query>",
          "joox <query>"
        ]
      },
      {
        name: "RANDOM MENU",
        list: [
          "stikerpatrick",
          "ppcouple"
        ]
      }
    ]
  };
  var txt = `⋆ ˚｡⋆୨୧˚ 【 *${botName}* 】 ˚୨୧⋆｡˚ ⋆\n\n`;
  for (var menu of obj.menu) {
    txt += `┌───【 *${menu.name}* 】\n`;
    for (var i = 0; i < menu.list.length; i++) {
      switch (menu.name) {
        case "INFO USER":
        case "INFO BOT":
          txt += `├─ ❀ ${menu.list[i]}\n`;
          break;
        default:
          txt += `├─ ❀ ${prefix + menu.list[i]}\n`;
          break;
      }
    }
    txt += `└───────────────\n\n`;
  }
  txt += `─────【 © *${botName}* 】─────`;
  return txt;
}

function rules(prefix) {
  return `*──「 RULES-BOT 」──*
  
  1. Jangan spam bot. 
  Sanksi: *WARN/SOFT BLOCK*
  
  2. Jangan telepon bot.
  Sanksi: *SOFT BLOCK*
  
  3. Jangan entod bot.
  Sanksi: *PERMANENT BLOCK*
  
  Jika sudah paham rulesnya
  Ketik *${prefix}menu* untuk memulai bot`
}

function donasi() {
  return `Gak Ada`;
}

module.exports = { menu, rules, donasi };