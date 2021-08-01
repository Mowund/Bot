const Discord = require('discord.js');
const tc = require('tinycolor2');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const xhr = new XMLHttpRequest();
const url = require('url');

function getTSE(instance, guild, path, values) {
  if (Array.isArray(path)) {
    return instance.messageHandler.getEmbed(guild, path[0], path[1], values);
  } else {
    return instance.messageHandler.get(guild, path, values);
  }
}
module.exports.getTSE = (instance, guild, path, values) =>
  getTSE(instance, guild, path, values);

module.exports.iCP = async (
  inst,
  client,
  opt,
  itc,
  cnt,
  eph,
  tts,
  emb,
  cmps
) => {
  const guildI = itc.guild_id;
  const uI = itc.member.user;
  const uIF = await client.users.fetch(uI.id);
  function getTS(path, values) {
    return getTSE(inst, guildI, path, values);
  }
  if (!cnt || cnt === 0) {
    cnt = '';
  }

  if (!eph || eph === 0) {
    eph = 0;
  } else if (eph === 1) {
    eph = 64;
  }

  if (!tts || tts === 0) {
    tts = false;
  } else if (tts === 1) {
    tts = true;
  }

  var dt = {
    content: cnt,
    flags: eph,
    tts: tts,
    embeds: [emb],
    components: cmps,
  };

  if (!emb || emb === 0) {
    dt = {
      content: cnt,
      flags: eph,
      tts: tts,
      components: cmps,
    };
  } else if (emb === 1) {
    if (!cnt) {
      var cnt = [];
    }
    if (!cnt[0] || cnt[0] == 0) {
      cnt[0] = getTS('GENERIC_ERROR');
    }
    if (!cnt[1] || cnt[1] == 0) {
      cnt[1] = getTS('GENERIC_ERROR_COMMAND');
    }
    if (!cnt[2] || cnt[2] == 0) {
      cnt[2] = '#ff0000';
    }

    let embed = new Discord.MessageEmbed()
      .setTitle(cnt[0])
      .setDescription(cnt[1])
      .setColor(cnt[2])
      .setFooter(
        getTS('GENERIC_REQUESTED_BY', {
          USER: uIF.username,
        }),
        uIF.avatarURL()
      )
      .setTimestamp(Date.now());

    dt = {
      flags: eph,
      tts: tts,
      embeds: [embed],
      components: cmps,
    };
  }

  if (opt === 1) {
    return client.api
      .interactions(itc.id, itc.token)
      .callback.post({ data: { type: 7, data: dt } });
  } else if (opt === 2) {
    return client.api
      .interactions(itc.id, itc.token)
      .callback.post({ data: { type: 6 } });
  } else if (opt === 3) {
    return client.api
      .interactions(itc.id, itc.token)
      .callback.post({ data: { type: 6 } })
      .then(
        client.api
          .webhooks(client.user.id, itc.token)
          .messages('@original')
          .patch({ data: dt })
      );
  } else if (opt === 4) {
    return client.api
      .webhooks(client.user.id, itc.token)
      .messages('@original')
      .get();
  } else if (opt === 5) {
    return client.api
      .interactions(itc.id, itc.token)
      .callback.post({ data: { type: 6 } })
      .then(
        client.api
          .webhooks(client.user.id, itc.token)
          .messages('@original')
          .delete()
      );
  } else {
    return client.api
      .interactions(itc.id, itc.token)
      .callback.post({ data: { type: 4, data: dt } });
  }
};

module.exports.msgEdit = async (chan, id, medit) => {
  try {
    const message = await chan.messages.fetch(id);
    await message.edit(medit);
  } catch (err) {
    console.error(err);
  }
};

module.exports.diEmb = (
  inst,
  client,
  eMsg,
  msg,
  eU,
  diEV,
  eC,
  title,
  footer,
  desc,
  diT,
  diB,
  diL
) => {
  var guild = msg.guild;
  if (eMsg === 2) {
    guild = client.guilds.cache.get(msg.guild_id);
  }
  function getTS(path, values) {
    return getTSE(inst, guild, path, values);
  }

  var ciCE = '000000';

  if (eC && eC != 0) {
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
    var diT = getTS('COLOR_INVALID_IMG');
  }

  if (!diEV || diEV === 0 || diEV === 1) {
    if (eMsg === 2) {
      msg = msg.message;
    }
    if (msg.embeds[0]) {
      var embIURL = new URL(msg.embeds[0].image.url).pathname.split(/[\/&]/);
    } else {
      var embIURL = [];
    }
    var diEV = [embIURL[4]];
  }

  if (!title || title === 0) {
    var title = getTS('COLOR_INVALID');
  }

  if (!footer || footer === 0) {
    footer = getTS('GENERIC_REQUESTED_BY', {
      USER: eU.username,
    });
  } else if (footer === 1) {
    footer = getTS('GENERIC_INTERACTED_BY', {
      USER: eU.username,
    });
  }

  var emb = new Discord.MessageEmbed()
    .setColor(ciCE)
    .setTitle(title)
    .setImage(
      `https://dummyimage.com/300x100/${diB}/${diL}&${diEV[0]}&text=+${
        url.parse(diT).path
      }`
    )
    .setFooter(footer, eU.avatarURL())
    .setTimestamp(Date.now());

  if (desc && desc != 0) {
    emb = emb.setDescription(desc);
  }

  if (eMsg === 0 || eMsg === 2) {
    return emb;
  } else if (eMsg === 1) {
    msg.channel.send(emb);
  } else {
    eMsg.edit(emb);
  }
};

module.exports.toUTS = (time, style) => {
  if (!time) {
    var time = 0;
  }
  if (!style) {
    var style = 'f';
  }
  return `<t:${new Date(time).getTime().toString().slice(0, -3)}:${style}>`;
};

module.exports.checkImage = (url) => {
  return new Promise(function (resolve, reject) {
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onload = function () {
      status = xhr.status;
      if (xhr.status == 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
  });
};
