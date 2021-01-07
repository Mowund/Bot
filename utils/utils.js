const Discord = require('discord.js');
const tc = require('tinycolor2');
const client = new Discord.Client();

module.exports.msgEdit = async (chan, id, medit) => {
  try {
    const message = await chan.messages.fetch(id);
    await message.edit(medit);
  } catch (err) {
    console.error(err);
  }
};

module.exports.diEmb = (
  eMsg,
  msg,
  eU,
  eC,
  title,
  footer,
  desc,
  diT,
  diB,
  diL
) => {
  var ciCE = '000000';

  if (eC && eC !== 0) {
    if (!diB || diB === 1) {
      var diB = eC.replace('000000', '000001');
    }

    ciCE = diB.replace('ffffff', 'fffffe');

    if (!diL || diL === 1) {
      var diL = '000000';
      if (tc(eC).isDark()) {
        diL = 'ffffff';
      }
    }
    if (!diT || diT === 1) {
      var diT = eC;
    }
  }

  if (!diB || diB === 0) {
    var diB = '000000';
  }
  if (!diL || diL === 0) {
    var diL = 'ffffff';
  }
  if (!diT || diT === 0) {
    var diT = 'Inválido';
  }

  if (!title || title === 0) {
    var title = 'Cor inválida';
  }

  if (!footer || footer === 0) {
    footer = `Solicitado por ${eU.username}`;
  } else if (footer === 1) {
    footer = `Interagido por ${eU.username}`;
  }

  var emb = new Discord.MessageEmbed()
    .setColor(ciCE)
    .setTitle(title)
    .setImage(`https://dummyimage.com/6600x2424/${diB}/${diL}&text=+${diT}`)
    .setFooter(footer, eU.avatarURL())
    .setTimestamp(Date.now());

  if (desc && desc !== 0) {
    emb = emb.setDescription(desc);
  }

  if (eMsg === 0) {
    return emb;
  } else if (eMsg === 1) {
    msg.channel.send(emb);
  } else {
    eMsg.edit(emb);
  }
};
