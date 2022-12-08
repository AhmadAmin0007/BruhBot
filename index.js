"use strict";

try {
  const {
    default: makeWASocket,
    BufferJSON,
    DisconnectReason,
    makeInMemoryStore,
    useSingleFileAuthState,
    downloadContentFromMessage
  } = require("@adiwajshing/baileys");
  const fs = require("fs");
  const logg = require("pino");
  const cfonts = require("cfonts");
  const chalk = require("chalk");
  const { fetchJson, runtime, em, getGroupAdmin, fswrite, getBuffer } = require("./lib/func");
  const Exif = require("./lib/set_WM_Sticker");
  const exif = new Exif();
  const { exec } = require("child_process");
  const { color } = require("./lib/color");
  const moment = require("moment-timezone");
  const ffmpeg = require("fluent-ffmpeg");
  const brainly = require("brainly-scraper");
  const { menu, rules, donasi } = require("./help");
  const setting = JSON.parse(fs.readFileSync("./config.json"));
  const user = JSON.parse(fs.readFileSync("./database/user.json"));
  const prem = JSON.parse(fs.readFileSync("./database/premium.json"));
  const res = JSON.parse(fs.readFileSync("./database/response.json"));
  const nsfw = JSON.parse(fs.readFileSync("./database/nsfw.json"));
  const owner = setting.ownerNumber;
  const botName = setting.botName;
  const apih = setting.apih;
  const session = `./${setting.sessionName}.json`;
  const { state, saveState } = useSingleFileAuthState(session);

  function nocache(module, cb = () => { }) {
    console.log(`File ${module} sedang diperhatikan terhadap perubahan`);
    fs.watchFile(require.resolve(module), async () => {
      await uncache(require.resolve(module));
      cb(module);
    });
  }

  function uncache(module = ".") {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(module)];
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  const store = makeInMemoryStore({ logger: logg().child({ level: "fatal", stream: "store" }) });

  const connectToWhatsApp = async () => {
    const conn = makeWASocket({
      printQRInTerminal: true,
      logger: logg({ level: "fatal" }),
      auth: state,
      browser: [setting.botName, "Safari", "1.0.0"]
    });
    store.bind(conn.ev);
    cfonts.say(`${setting.botName}`, {
      font: "chrome",
      align: "center",
      gradient: ["#8F00FF", "red"]
    });
    cfonts.say(`Owner: AhmadAmin`, {
      font: "console",
      align: "center",
      gradient: ["#8F00FF", "red"]
    });
    conn.ws.on("CB:call", async (json) => {
      console.log(json);
    });
    conn.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      var type = "";
      try {
        type = Object.keys(msg.message)[0];
      } catch (e) {
        type = null;
      }
      const from = msg.key.remoteJid;
      const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : '';
      const isMulti = setting.multiPrefix;
      const prefix = isMulti ? /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : setting.prefix : setting.prefix;
      res.user = res.user.replace("{prefix}", prefix);
      res.ver = res.ver.replace("{prefix}", prefix);
      const body = chats.startsWith(prefix) ? chats : "";
      const args = body.trim().split(/ +/).slice(1);
      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
      const isCmd = body.startsWith(prefix);
      const cmd = isCmd ? chats : "";
      const isGroup = msg.key.remoteJid.endsWith("@g.us");
      const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.key.participant) : msg.key.remoteJid;
      const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
      const isOwner = owner.includes(sender);
      const isPrem = prem.includes(sender.split("@")[0]);
      const isUser = user.includes(sender);
      const pushname = msg.pushName;
      const groupMetadata = isGroup ? await conn.groupMetadata(from) : "";
      const groupMembers = isGroup ? groupMetadata.participants : "";
      const groupAdmin = isGroup ? getGroupAdmin(groupMembers) : "";
      const isBga = groupAdmin.includes(botNumber);
      const isGcAdmin = groupAdmin.includes(sender);
      const isImage = (type === "imageMessage");
      const isQuotedImage = (type === "extendedTextMessage");
      const isNsfw = nsfw.includes(from);
      const participant = isGroup ? await groupMetadata.participants : "";
      const groupName = isGroup ? groupMetadata.subject : "";
      const q = args.join(" ");
      const waktu = moment(Date.now()).tz("Asia/Jakarta").format("HH:mm:ss");
      const sendContact = (numbers, name, quoted, mn) => {
        let number = numbers.replace(/[^0-9]/g, '')
        const vcard = 'BEGIN:VCARD\n'
          + 'VERSION:3.0\n'
          + 'FN:' + name + '\n'
          + 'ORG:;\n'
          + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
          + 'END:VCARD'
        conn.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions: mn ? mn : [] }, { quoted: quoted })
      }
      conn.readMessages([msg.key]);
      if (isCmd) {
        console.log(`${color("【", "yellow")} ${color(isGroup ? "GROUP" : "PRIVATE", "blue")} ${color("】", "yellow")}${isGroup ? " " + color("(", "yellow") + color(groupName, "magenta") + color(")", "yellow") : ""} ${color(waktu, "red")} ${color(pushname, "green")}: ${cmd}`);
      }
      switch (command) {
        case "verify":
          if (!isUser) {
            user.push(sender);
            fs.writeFileSync("./database/user.json", JSON.stringify(user));
            conn.sendMessage(from, {
              text: res.ver,
              footer: "Klik untuk melihat rules.",
              mentions: [sender],
              buttons: [
                {
                  buttonId: prefix + "rules",
                  buttonText: {
                    displayText: "RULES"
                  },
                  type: 1
                }
              ],
            }, { quoted: msg });
          } else {
            reply(res.alVer);
          }
          break;
        case "menu":
        case "menus":
        case "help":
          if (!isUser) return reply(res.user);
          const statuss = isOwner ? "owner" : isPrem ? "premium" : isUser ? "user" : "";
          const menus = menu(sender.split("@")[0], statuss, "", waktu, botName, setting.ownerName, prefix, isMulti ? "[ MULTI PREFIX ]" : prefix, runtime(process.uptime()), user.length);
          reply(menus, [sender]);
          break;
        case "req":
        case "request":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("pekob");
          reply("Berhasil request fitur.");
          var f = `┌───【 *REQUEST* 】\n`;
          f += `│ Dari: @${sender.split("@")[0]}\n`;
          f += `│ Fitur: *${q}*\n`;
          f += `└───【 *${botName}* 】`;
          for (var ow of owner) conn.sendMessage(ow, { text: f, mentions: [sender] });
          break;
        //OWNER MENU
        case "addprem":
          if (!isOwner) return reply(res.owner);
          var no = args[0];
          if (em(no)) return ex(botNumber.split("@")[0] + " / <mentions>");
          if (no.startsWith("@")) no = no.replace("@", "");
          if (prem.includes(no)) return reply(`@${no} sudah premium.`, [no + "@s.whatsapp.net"]);
          prem.push(no);
          fs.writeFileSync("./database/premium.json", JSON.stringify(prem));
          reply(`Berhasil menambahkan @${no} premium.`, [no + "@s.whatsapp.net"]);
          break;
        case "delprem":
          if (!isOwner) return reply(res.owner);
          var no = args[0];
          if (em(no)) return ex(botNumber.split("@")[0] + " / <mentions>");
          if (no.startsWith("@")) no = no.replace("@", "");
          if (!prem.includes(no)) return reply(`@${no} tidak premium.`, [no + "@s.whatsapp.net"]);
          var index = prem.indexOf(no);
          if (index > -1) prem.splice(index, 1);
          fs.writeFileSync("./database/premium.json", JSON.stringify(prem));
          reply(`Berhasil menghapus premium @${no}`, [no + "@s.whatsapp.net"]);
          break;
        case "set":
          if (!isOwner) return reply(res.owner);
          const opt = args[0];
          if (em(opt)) return ex(`<multiprefix/prefix/botname/owner>`);
          if (opt === "multiprefix") {
            if (isMulti) {
              setting.multiPrefix = false;
              fswrite("./config.json", setting);
              reply(`Mengubah prefix ke ${prefix}`);
            } else {
              setting.multiPrefix = true;
              fswrite("./config.json", setting);
              reply(`Mengubah prefix ke multiprefix`);
            }
          } else if (opt === "prefix") {
            const pref = args[1];
            if (em(pref)) return ex("prefix <prefix>");
            setting.prefix = pref;
            fswrite("./config.json", setting);
            reply(`Mengubah prefix ke ${pref}`);
          } else if (opt === "botname") {
            const newbot = args[1];
            if (em(newbot)) return ex("botname <nama baru>");
            setting.botName = newbot;
            fswrite("./config.json", setting);
            reply(`Berhasil mengubah nama bot menjadi *${newbot}*`);
          } else if (opt === "owner") {
            var ownum = setting.ownerNumber;
            var newOwn = args[1];
            if (em(newOwn)) return ex("<mentions/number>");
            if (newOwn === "random") {
              function ra() {
                return groupMembers[Math.floor(Math.random() * groupMembers.length)].id;
              }
              var fi = ownum.includes(ra());
              if (fi) newOwn = ra().split("@")[0]; else newOwn = ra().split("@")[0];
            }
            if (newOwn.startsWith("@")) newOwn = newOwn.replace("@", "");
            newOwn = Number(newOwn);
            if (typeof newOwn === "string") return reply("Harus nomor.");
            var net = newOwn + "@s.whatsapp.net";
            if (ownum.includes(net)) {
              var index = ownum.indexOf(net);
              if (index > -1) ownum.splice(index, 1);
              fswrite("./config.json", setting);
              return reply(`Mengahapus owner @${newOwn}`, [net]);
            } else {
              setting.ownerNumber.push(net);
              fswrite("./config.json", setting);
              reply(`Berhasil menambahkan @${newOwn} ke owner.`, [net]);
            }
          } else {
            reply(`Options tidak ada.`);
          }
          break;
        case "uptime":
          if (!isOwner) return reply(res.owner);
          reply(`Uptime: ${runtime(process.uptime())}`);
          break;
        //MAIN MENU
        case "owner":
          var txt = "┌───【 *OWNER LIST* 】\n";
          for (var cont of owner) {
            txt += `│ ${!em(cont) ? `@${cont.replace("@s.whatsapp.net", "")}` : "Tidak ada owner."} \n`;
          }
          txt += `└───【 *${botName}* 】`;
          reply(txt, owner);
          break;
        case "rules":
          reply(rules(prefix));
          break;
        case "donasi":
          reply(donasi());
          break;
        //PREMIUM MENU
        case "join":
          if (!isUser) return reply(res.user);
          if (!isPrem) return reply(res.prem);
          if (!isBga) return reply(res.bot);
          const link = args[0];
          if (em(link)) return ex("https://chat.whatsapp.com/EU1SOmJQ5oTJyHMMZ52G94");
          if (!link.startsWith("https://chat.whatsapp.com/")) return reply("Link invalid.");
          const code = link.split("/")[3];
          if (em(code)) return reply("Link invalid.");
          const gai = await conn.groupAcceptInvite(code);
          reply("Berhasil masuk " + gai);
          break;
        //ISLAMIC MENU
        case "surah":
          if (!isUser) return reply(res.user);
          const surah = fs.readFileSync("./surah.json");
          const srh = JSON.parse(surah);
          var txt = "┌───【 *LIST SURAH* 】\n";
          for (var dt of srh.data) {
            txt += `│ ${dt.number}. *${dt.asma.id.short}* (${dt.asma.translation.id})\n`;
          }
          txt += `└───【 *${botName}* 】`;
          if (em(q)) return reply(txt);
          var d = srh.data.find((v) => v.number === Number(q) || v.asma.id.short.toLowerCase() === q.toLowerCase());
          if (typeof d === "undefined") reply("Surah tidak ditemukan."); else {
            var t = "┌───【 *SURAH* 】\n";
            t += `│ Surah: *${d.asma.id.short}* (${d.asma.ar.short})\n`;
            t += `│ Arti: *${d.asma.translation.id}*\n`;
            t += `│ Surah ke: *${d.number}*\n`;
            t += `│ Ayat: *${d.ayahCount}* ayat\n`;
            t += `│ Diturunkan di: *${d.type.id}*\n`;
            t += `│ Tafsir: *${d.tafsir.id}*\n`;
            t += `└───【 *${botName}* 】`;
            reply(t);
            sendAudio(d.recitation.full, d.asma.id.long);
          }
          break;
        case "jadwalsholat":
          if (!isUser) return reply(res.user);
          var d = await fetchJson(`https://api.myquran.com/v1/sholat/kota/semua`);
          var txt = "┌───【 *LIST KOTA* 】\n";
          for (var dt of d) {
            txt += `│ ${dt.id}. ${dt.lokasi}\n`;
          }
          txt += `└───【 *${botName}* 】`;
          if (em(q)) return reply(txt);
          var a = d.find(x => x.lokasi.toLowerCase() === q.toLowerCase());
          if (typeof a === "undefined") return reply("Kota salah atau tidak ada.");
          var date = new Date();
          var id = a.id;
          var thn = date.getFullYear();
          var bln = date.getMonth() + 1;
          var tgl = date.getDate();
          reply(res.wait);
          var r = await fetchJson(`https://api.myquran.com/v1/sholat/jadwal/${id}/${thn}/${bln}/${tgl}`);
          var data = r.data;
          var txt = "┌───【 *JADWAL SHOLAT* 】\n";
          txt += `│ Lokasi: ${data.lokasi}\n`;
          txt += `│ Daerah: ${data.daerah}\n`;
          txt += `│ Tanggal: ${data.jadwal.tanggal}\n`;
          txt += `│ Imsak: *${data.jadwal.imsak}*\n`;
          txt += `│ Subuh: *${data.jadwal.subuh}*\n`;
          txt += `│ Terbit: *${data.jadwal.terbit}*\n`;
          txt += `│ Dhuha: *${data.jadwal.dhuha}*\n`;
          txt += `│ Dzuhur: *${data.jadwal.dzuhur}*\n`;
          txt += `│ Ashar: *${data.jadwal.ashar}*\n`;
          txt += `│ Maghrib: *${data.jadwal.maghrib}*\n`;
          txt += `│ Isya: *${data.jadwal.isya}*\n`;
          txt += `└───【 *${botName}* 】`;
          reply(txt);
          break;
        //GROUP MENU
        case "linkgroup":
        case "linkgc":
        case "linkgrub":
        case "linkgrup":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          const codes = await conn.groupInviteCode(from);
          reply(`Link: https://chat.whatsapp.com/${codes}`);
          break;
        case "promote":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          if (!isGcAdmin) return reply(res.adminGc);
          const n = args[0];
          if (em(n)) return ex("<mentions>");
          var net = n.replace("@", "") + "@s.whatsapp.net";
          if (groupAdmin.includes(net)) return reply(`${n} sudah admin.`, [net]);
          conn.groupParticipantsUpdate(from, [net], "promote");
          reply(`${n} telah dipromote.`, [net]);
          break;
        case "demote":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          if (!isGcAdmin) return reply(res.adminGc);
          const n_ = args[0];
          if (em(n_)) return ex("<mentions>");
          const net_ = n_.replace("@", "") + "@s.whatsapp.net";
          if (net_ === groupMetadata.owner) return reply(`Tidak bisa demote owner group.`);
          if (!groupAdmin.includes(net_)) return reply(`${n_} sekarang tidak admin.`, [net_]);
          conn.groupParticipantsUpdate(from, [net_], "demote");
          reply(`${n_} telah didemote.`, [net_]);
          break;
        case "add":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (!isBga) return reply(res.bot);
          var no = args[0];
          if (em(no)) return ex(botNumber.split("@")[0]);
          var net = no + "@s.whatsapp.net";
          var p1 = await conn.groupParticipantsUpdate(from, [net], "add");
          if (p1[0].status !== "200") reply(res.error);
          break;
        case "kick":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (!isBga) return reply(res.bot);
          var no = args[0];
          if (em(no)) return ex(botNumber.split("@")[0] + " / <mentions>");
          if (no.startsWith("@")) no = no.replace("@", "");
          var net = no + "@s.whatsapp.net";
          const p = await conn.groupParticipantsUpdate(from, [net], "remove");
          if (p[0].status !== "200") reply(res.error);
          break;
        case "group":
        case "gc":
        case "grub":
        case "grup":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          if (!isGcAdmin) return reply(res.adminGc);
          if (em(q)) return ex(`<open/close/nsfw/antilink>`);
          if (q === "open") {
            conn.groupSettingUpdate(from, "not_announcement");
          } else if (q === "close") {
            conn.groupSettingUpdate(from, "announcement");
          } else if (q === "nsfw") {
            if (isNsfw) {
              var index = nsfw.indexOf(from);
              if (index > -1) nsfw.splice(index, 1);
              fswrite("./database/nsfw.json", nsfw, 0);
              reply("Menonaktifkan nsfw");
            } else {
              nsfw.push(from);
              fswrite("./database/nsfw.json", nsfw, 0);
              reply("Mengaktifkan nsfw.");
            }
          }
          break;
        case "hidetag":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (em(q)) return ex("<text>");
          var mem = [];
          groupAdmin.map(i => mem.push(i.id));
          send(q, mem);
          break;
        case "tagall":
          if (!isUser) return reply(res.user);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          var txt = "┌───【 *TAG ALL* 】\n";
          for (var mem of participant) {
            txt += `├ @${mem.id.split("@")[0]}\n`;
          }
          txt += `└───【 *BruhBot* 】`;
          reply(txt, participant.map(a => a.id));
          break;
        //STALKER MENU
        case "servermcjava":
          if (!isUser) return reply(res.user);
          if (!isPrem) return reply(res.prem);
          if (em(q)) return ex(`<ip:port>`, "Port kosong akan diganti port default.");
          var ip = q.split(":")[0];
          var port = q.split(":")[1];
          if (em(ip)) return reply(`Parameter ip tidak boleh kosong.`);
          if (em(port)) port = "25565";
          reply(res.wait);
          var srv = await fetchJson(`https://api.mcsrvstat.us/2/${ip}:${port}`);
          var a = srv.debug || {};
          var b = a.dns || {};
          if (b.hasOwnProperty("error") || srv.hasOwnProperty("error")) return reply("Ip tidak ditemukan.");
          var on = srv.online;
          var txt = "┌─ 【 *SERVER MINECRAFT* 】\n";
          txt += `├ Server: java\n`;
          txt += `├ Ip: ${ip}\n`;
          txt += `├ Port: ${port}\n`;
          txt += `├ Versi: ${on ? srv.version : "server offline"}\n`;
          txt += `├ Status: ${on ? "online" : "offline"}\n`;
          txt += `├ Player: ${on ? srv.players.online : "0"}/${on ? srv.players.max : "0"}\n`;
          txt += `└ Motd: \n${on ? srv.motd.clean.join("\n") : "server offline"}`;
          sendImg(txt, `https://api.mcsrvstat.us/icon/${ip}`);
          break;
        case "github":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("<username>");
          var gh = await fetchJson(`https://api.github.com/users/${q}`);
          var ms = gh.message || "";
          if (ms === "Not Found") return reply(`Username ${q} tidak ada.`);
          var txt = "┌───【 *GITHUB* 】\n";
          txt += `│ Username: ${gh.login}\n`;
          txt += `│ Followers: ${gh.followers}\n`;
          txt += `│ Following: ${gh.following}\n`;
          txt += `│ Bio: ${gh.bio === null ? "Tidak Ada" : gh.bio}\n`;
          txt += `│ Email: ${gh.email === null ? "Tidak Ada" : gh.email}\n`;
          txt += `│ Location: ${gh.location === null ? "Tidak Ada" : gh.location}\n`;
          txt += `│ Url: ${gh.html_url}\n`;
          txt += `└───【 *${botName}* 】`;
          sendImg(txt, gh.avatar_url);
          break;
        //SEACRH MENU
        /*case "xnxxsearch":
          if (!isUser) return reply(res.user);
          if (!isPrem) return reply(res.prem);
          const query = q;
          if (em(query)) return ex("japanese");
          reply(res.wait);
          const xnxx = await fetchJson(`https://api.lolhuman.xyz/api/xnxxsearch?apikey=sadteams&query=${query}`);
          if (xnxx.status === 500) return reply(res.error);
          var txt = `┌ 【 *XNXX SEARCH* 】\n`;
          for (var data of xnxx.result) {
            txt += `├ TITLE : ${data.title}\n`;
            txt += `├ VIEWS : ${data.views}\n`;
            txt += `├ DURATION : ${data.duration}\n`;
            txt += `├ UPLOADER : ${data.uploader}\n`;
            txt += `├ LINK : ${data.link}\n`;
            txt += `├ THUMB : ${data.thumbnail}\n`;
            txt += `├───────────────────\n`;
          }
          txt += `└ 【 *${botName}* 】`;
          reply(txt);
          break;*/
        case "brainly":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("<text>");
          var txt = "┌──【 *BRAINLY* 】\n";
          var br = await brainly(q, 3);
          if (!br.success) return reply(res.error);
          for (var b of br.data) {
            txt += `┌─────────────\n`
            txt += `│ ${b.pertanyaan}\n`;
            for (var j of b.jawaban) {
              txt += `│ Jawaban: ${j.text}\n`;
            }
            txt += `└─────────────\n\n`;
          }
          txt += `──【 *${botName}* 】──`;
          reply(txt);
          break;
        case "pinterest":
        case "pr":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("<query>");
          reply(res.wait);
          var pin = await fetchJson(`https://api.lolhuman.xyz/api/pinterest?apikey=${apih}&query=${q}`);
          if (pin.status === 200) {
            sendImg(q, pin.result);
          } else {
            reply(`Tidak ada hasil untuk *${q}*`);
          }
          break;
        case 'sticker': case 's': case 'stiker':
          if (!isUser) return reply(res.user)
          if (isImage || isQuotedImage) {
            await conn.downloadAndSaveMediaMessage(msg, "image", `./sticker/${sender.split("@")[0]}.jpeg`)
            let buffer = fs.readFileSync(`./sticker/${sender.split("@")[0]}.jpeg`)
            reply(res.wait)
            var rand1 = 'sticker/' + getRandom('.jpeg')
            var rand2 = 'sticker/' + getRandom('.webp')
            fs.writeFileSync(`${rand1}`, buffer)
            ffmpeg(`./${rand1}`)
              .on("error", console.error)
              .on("end", () => {
                exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                  conn.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                  fs.unlinkSync(`./${rand1}`)
                  fs.unlinkSync(`./sticker/${sender.split("@")[0]}.jpeg`)
                  fs.unlinkSync(`./${rand2}`)
                })
              }).addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"]).toFormat('webp').save(`${rand2}`)
          } else {
            reply(`Kirim gambar dengan caption ${prefix + command} atau balas gambar yang sudah dikirim`)
          }
          break;
        case "setwm":
          if (!isUser) return reply(res.user);
          if (!isOwner) return reply(res.owner);
          if (em(q)) return ex("<packname|authorname>");
          var s = q.split("|");
          var packname = s[0];
          var authorname = s[1];
          if (em(packname)) return reply("Packname harus di isi.");
          if (em(authorname)) return reply("Authorname harus di isi.");
          exif.create(packname, authorname);
          reply("Berhasil setwm.");
          break;
        case "sound":
          if (!isUser) return reply(res.user);
          if (em(args[0])) return ex("<number>");
          if (Number(args[0]) > 74) return reply("Max 74");
          if (typeof Number(args[0]) !== "number") return reply("Harus nomor.");
          reply(res.wait);
          var buf = await getBuffer(`https://github.com/saipulanuar/Api-Github/raw/main/sound/sound${args[0]}.mp3`);
          conn.sendMessage(from, { audio: buf, mimetype: "audio/mpeg", ptt: true }, { quoted: msg });
          break;
        case "twitter":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("<username>");
          reply(res.wait);
          var t = await fetchJson(`https://api.lolhuman.xyz/api/twitter/${q}?apikey=${apih}`);
          if (t.status === 500) return reply(`Username *${q}* tidak ditemukan.`);
          var r = t.result;
          var txt = "┌───【 *TWITTER* 】\n";
          txt += `│ Nama: *${r.name}*\n`;
          txt += `│ Deskripsi: ${r.description}\n`;
          txt += `│ Followers: *${abbreviateNumber(r.followers)}*\n`;
          txt += `│ Following: *${abbreviateNumber(r.following)}*\n`;
          txt += `│ Tweet: *${abbreviateNumber(r.tweet)}*\n`;
          txt += `│ Bergabung: *${new Date(r.joined).toLocaleString("id")}*\n`;
          txt += `└───【 *${botName}* 】`;
          sendImg(txt, r.profile_picture);
          break;
        case "tiktok":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("<username>");
          reply(res.wait);
          var t = await fetchJson(`https://api.lolhuman.xyz/api/stalktiktok/${q}?apikey=${apih}`);
          if (t.status === 500) return reply(`Username *${q}* tidak ditemukan.`);
          var r = t.result;
          var txt = "┌───【 *TIK TOK* 】\n";
          txt += `│ Username: *${r.username}*\n`;
          txt += `│ Nickname: *${r.nickname}*\n`;
          txt += `│ Bio: ${r.bio}\n`;
          txt += `│ Followers: *${abbreviateNumber(r.followers)}*\n`;
          txt += `│ Following: *${abbreviateNumber(r.followings)}*\n`;
          txt += `│ Likes: *${abbreviateNumber(r.likes)}*\n`;
          txt += `│ Video: *${abbreviateNumber(r.video)}*\n`;
          txt += `└───【 *${botName}* 】`;
          sendImg(txt, r.user_picture);
          break;
        case "instagram":
        case "ig":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("<username>");
          reply(res.wait);
          var t = await fetchJson(`https://api.lolhuman.xyz/api/stalkig/${q}?apikey=${apih}`);
          if (t.status === 404) return reply(`Username *${q}* tidak ditemukan.`);
          var r = t.result;
          var txt = "┌───【 *INSTAGRAM* 】\n";
          txt += `│ Name: *${r.fullname}* (${r.username})\n`;
          txt += `│ Bio: ${r.bio}\n`;
          txt += `│ Posts: ${abbreviateNumber(r.posts)}\n`;
          txt += `│ Followers: *${abbreviateNumber(r.followers)}*\n`;
          txt += `│ Following: *${abbreviateNumber(r.following)}*\n`;
          txt += `└───【 *${botName}* 】`;
          sendImg(txt, r.photo_profile);
          break;
        case "joox":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("melukis senja");
          reply(res.wait);
          var d = await fetchJson(`https://api.lolhuman.xyz/api/jooxplay?apikey=${apih}&query=${q}`);
          if (d.status === 500) return reply(`Lagu *${q}* tidak ditemukan.`);
          var r = d.result;
          var txt = "┌───【 *JOOX* 】\n";
          txt += `│ Lagu: *${r.info.song}*\n`;
          txt += `│ Artis: *${r.info.singer}*\n`;
          txt += `│ Album: *${r.info.album}*\n`;
          txt += `│ Durasi: *${r.info.duration}*\n`;
          txt += `│ Dibuat: *${r.info.date}*\n`;
          txt += `└───【 *${botName}* 】\n`;
          txt += `_Audio sedang di kirim.._`;
          sendImg(txt, r.image);
          var l = r.audio[r.audio.length - 1].link;
          if (l === "") l = r.audio[0].link;
          sendAudio(l);
          break;
        case "ppcouple":
          if (!isUser) return reply(res.user);
          reply(res.wait);
          var d = await fetchJson(`https://api.lolhuman.xyz/api/random/ppcouple?apikey=${apih}`);
          sendImg("Cowok", d.result.male);
          sendImg("Cewek", d.result.female);
          break;
        case "stikerpatrick":
        case "stickerpatrick":
          if (!isUser) return reply(res.user);
          reply(res.wait);
          var buf = await getBuffer(`https://api.lolhuman.xyz/api/sticker/patrick?apikey=${apih}`);
          conn.sendMessage(from, { sticker: buf }, { quoted: msg });
          break;
        case "ytaudio":
          if (!isUser) return reply(res.user);
          if (em(q)) return ex("<link youtube>");
          reply(res.wait);
          var d = await fetchJson(`https://api.lolhuman.xyz/api/ytaudio?apikey=${apih}&url=${q}`);
          if (d.status === 500) return reply(`Link *${q}* tidak ditemukan.`);
          var id = q.split("/")[3];
          var li = await fetchJson(`https://returnyoutubedislikeapi.com/votes?videoId=${id}`);
          var r = d.result;
          var txt = "┌───【 *YOUTUBE* 】\n";
          txt += `│ Judul: *${r.title}*\n`;
          txt += `│ Channel: *${r.uploader}*\n`;
          txt += `│ Link ch: *${r.channel}*\n`;
          txt += `│ Durasi: *${r.duration}*\n`;
          txt += `│ View: *${abbreviateNumber(r.view)}*\n`;
          txt += `│ Like: *${abbreviateNumber(li.likes)}*\n`;
          txt += `│ Dislike: *${abbreviateNumber(li.dislikes)}*\n`;
          txt += `│ Deskripsi:\n${r.description}\n`;
          txt += `└───【 *${botName}* 】\n`;
          txt += `_Audio sedang di kirim.._`;
          sendImg(txt, r.thumbnail);
          var l = r.link.link;
          sendAudio(l);
          break;
        case "purba":
          if (!isUser) return reply(res.user);
          if (!isPrem) return reply(res.prem);
          if (em(q)) return ex("pekob");
          var f = await fetchJson(`https://api.lolhuman.xyz/api/bahasapurba?apikey=${apih}&text=${q}`);
          reply(`*${f.result}*`);
          break;
        // NSFW MENU
        /*case "hentai":
        case "pussy":
        case "tits":
        case "feed":
        case "cum":
        case "kiss":
          if (!isUser) return reply(res.user);
          if (!isNsfw) return reply(res.nsfw);
          if (!isPrem) return reply(res.prem);
          reply(res.wait);
          try {
            sendImg(`Nih *${command}*.`, `https://api.lolhuman.xyz/api/random2/${command}?apikey=${apih}`);
          } catch (e) {
            reply(res.error);
          }
          break;
        case "milf":
        case "ahegao":
        case "loli":
          if (!isUser) return reply(res.user);
          if (!isNsfw) return reply(res.nsfw);
          if (!isPrem) return reply(res.prem);
          reply(res.wait);
          try {
            sendImg(`Nih *${command}*.`, `https://api.lolhuman.xyz/api/random/nsfw/${command}?apikey=${apih}`);
          } catch (e) {
            reply(res.error);
          }
          break;*/
      }
      function abbreviateNumber(value) {
        var newValue = value;
        if (value >= 1000) {
          var suffixes = ["", "rb", "jt", "m", "t"];
          var suffixNum = Math.floor(("" + value).length / 3);
          var shortValue = '';
          for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) { break; }
          }
          if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
          newValue = shortValue + suffixes[suffixNum];
        }
        return newValue;
      }
      function ex(arg = "", note = "") {
        if (em(note)) {
          reply(`Contoh:\n${cmd} ${arg}`);
        } else {
          reply(`Contoh:\n${cmd} ${arg}\nNOTE: ${note}`);
        }
      }
      function reply(content = "", mentions = []) {
        if (mentions.length === 0) {
          conn.sendMessage(from, { text: content, footer: `Author: ${setting.ownerName}` }, { quoted: msg });
        } else {
          conn.sendMessage(from, { text: content, footer: `Author: ${setting.ownerName}`, mentions: mentions }, { quoted: msg });
        }
      }
      function getRandom(ext) {
        return `${Math.floor(Math.random() * 10000)}${ext}`;
      }
      function send(content = "", mentions = []) {
        if (mentions.length === 0) {
          conn.sendMessage(from, { text: content });
        } else {
          conn.sendMessage(from, { text: content, mentions: mentions });
        }
      }
      function sendImg(content = "", url = "") {
        if (typeof url === "object") {
          reply(res.error);
        } else {
          conn.sendMessage(from, { image: { url: url }, caption: content }, { quoted: msg });
        }
      }
      function sendAudio(url = "", fileName = "") {
        conn.sendMessage(from, { audio: { url: url }, mimetype: "audio/mpeg", fileName: `${em(fileName) ? botName : fileName}.mp3` }, { quoted: msg });
      }
    });
    conn.ev.on("connection.update", (update) => {
      try {
        const { connection } = update;
        if (!em(update.qr)) {
          console.log(color("Silahkan scan qr code dibawah ini..", "yellow"));
        }
        if (connection === "close") {
          console.log(DisconnectReason.timedOut)
          connectToWhatsApp();
        }
        if (connection === "connecting") {
          console.log(color("Connecting..", "yellow"));
        }
        if (connection === "open") {
          const connected = chalk.hex("#39e75f");
          console.log(connected("Connected.."));
          setInterval(async () => {
            try {
              const api = await fetchJson("https://api.kanye.rest/");
              const trans = await fetchJson(`https://api.popcat.xyz/translate?to=id&text=${api.quote}`);
              conn.updateProfileStatus(trans.translated);
            } catch (e) {
              console.log("Error when fetch quote.");
            }
          }, 30000);
        }
      } catch (e) {
        connectToWhatsApp();
      }
    });
    conn.downloadAndSaveMediaMessage = async (msg, type_file, path_file) => {
      if (type_file === 'image') {
        var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === 'video') {
        var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === 'sticker') {
        var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === 'audio') {
        var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      }
    }
    conn.ev.on("creds.update", () => saveState);
    return conn;
  }

  connectToWhatsApp().catch(err => console.log("Error"));
} catch (e) {
  console.log("Ada yang error.");
  console.error(e);
}