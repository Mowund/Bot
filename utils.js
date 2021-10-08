const { MessageEmbed } = require('discord.js');
const tc = require('tinycolor2');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const xhr = new XMLHttpRequest();
const url = require('url');

module.exports.env = (key) => {
  try {
    var env = require('./env.json');
  } catch {
    var env = process.env;
  }

  if (key) return env[key];
  return env;
};

module.exports.search = (object, key) => {
  for (var key in object) {
    var value = object[key];
  }

  return value;
};

module.exports.getTSE = (guild, path, values) => getTSE(guild, path, values);

module.exports.iCP = async (client, opt, itc, cnt, eph, tts, emb, cmps) => {
  function getTS(path, values) {
    return getTSE(itc.guild_id, path, values);
  }
  var guildI = itc.guild_id;

  if (guildI) {
    var uI = itc.member.user;
    var uIF = await client.users.fetch(itc.member.user.id);
  } else {
    var uIF = await client.users.fetch(itc.user.id);
  }

  cnt ||= '';
  eph ||= 0;
  eph &&= 64;
  tts ||= false;
  tts &&= true;

  var dt = {
    content: cnt,
    flags: eph,
    tts: tts,
    embeds: [emb],
    components: cmps,
  };

  if (!emb) {
    dt ||= {
      content: cnt,
      flags: eph,
      tts: tts,
      components: cmps,
    };
  } else if (emb === 1) {
    cnt ||= [];

    if (!cnt[0] || cnt[0] == 0) {
      cnt[0] = getTS(['GENERIC', 'ERROR']);
    }
    if (!cnt[1] || cnt[1] == 0) {
      cnt[1] = getTS(['ERROR', 'UNALLOWED', 'COMMAND']);
    }
    if (!cnt[2] || cnt[2] == 0) {
      cnt[2] = 'ff0000';
    }

    var emb = new MessageEmbed()
      .setTitle(cnt[0])
      .setDescription(cnt[1])
      .setColor(cnt[2])
      .setFooter(
        getTS(['GENERIC', 'REQUESTED_BY'], {
          USER: uIF.username,
        }),
        uIF.avatarURL()
      )
      .setTimestamp(Date.now());

    dt = {
      flags: eph,
      tts: tts,
      embeds: [emb],
      components: cmps,
    };
  }

  switch (opt) {
    case 1:
      return client.api
        .interactions(itc.id, itc.token)
        .callback.post({ data: { type: 7, data: dt } });
    case 2:
      return client.api
        .interactions(itc.id, itc.token)
        .callback.post({ data: { type: 6 } });
    case 3:
      return client.api
        .interactions(itc.id, itc.token)
        .callback.post({ data: { type: 6 } })
        .then(
          client.api
            .webhooks(client.user.id, itc.token)
            .messages('@original')
            .patch({ data: dt })
        );
    case 4:
      return client.api
        .webhooks(client.user.id, itc.token)
        .messages('@original')
        .get();
    case 5:
      return client.api
        .interactions(itc.id, itc.token)
        .callback.post({ data: { type: 6 } })
        .then(
          client.api
            .webhooks(client.user.id, itc.token)
            .messages('@original')
            .delete()
        );
    case 6:
      return client.api
        .interactions(itc.id, itc.token)
        .callback.post({ data: { type: 5 } });
    case 7:
      return client.api
        .webhooks(client.user.id, itc.token)
        .messages('@original')
        .patch({ data: dt });
    case 8:
      return client.api.interactions(itc.id, itc.token).callback.post({
        data: {
          type: 8,
          data: {
            choices: [
              {
                name: cnt,
                value: cnt.toLowerCase().replace(/\s/g, '_'),
              },
            ],
          },
        },
      });
    default:
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

module.exports.diEmb = async (
  client,
  eMsg,
  interaction,
  msg,
  eU,
  diEV,
  eC,
  title,
  footer,
  description,
  diT,
  diB,
  diL
) => {
  function getTS(path, values) {
    return getTSE(interaction.guild_id, path, values);
  }
  var guild = msg.guild;
  if (eMsg === 2) {
    guild = client.guilds.cache.get(msg.guild_id);
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
    var embIURL = new URL(msg.embeds[0].image.url).pathname.split(/[\/&]/);
    var diEV = [embIURL[4]];
  }

  if (!title || title === 0) {
    var title = getTS('COLOR_INVALID');
  }

  if (!footer || footer === 0) {
    footer = getTS(['GENERIC', 'REQUESTED_BY'], {
      USER: eU.username,
    });
  } else if (footer === 1) {
    footer = getTS(['GENERIC', 'INTERACTED_BY'], {
      USER: eU.username,
    });
  }

  var emb = new MessageEmbed()
    .setColor(ciCE)
    .setTitle(title)
    .setImage(
      `https://dummyimage.com/300x100/${diB}/${diL}&${diEV[0]}&text=+${
        url.parse(diT).path
      }`
    )
    .setFooter(footer, eU.avatarURL())
    .setTimestamp(Date.now());

  if (description && description != 0) {
    emb = emb().setDescription(description);
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
  return new Promise(function (resolve) {
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onload = function () {
      if (xhr.status == 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
  });
};
