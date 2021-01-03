const Discord = require('discord.js');
const client = new Discord.Client();

module.exports.name = (emj) => {
  var eR = emj.replace('.', '');

  var a0 = '<:android:698280152383356968>',
    a1 = '<:esquerdista:422163606684303381>',
    a2 = '<:esquerdista2:465139204771282954>',
    a3 = '<:fuck:523846163057737728>',
    a4 = '<:holyshit:422170087907262465>',
    a5 = '<:ios:696483467936006182>',
    a6 = '<:linux:698280152357929001>',
    a7 = '<:mac:698280153003851817>',
    a8 = '<:mememan:676120579044278272>',
    a9 = '<:neutral_sign:696483468153979001>',
    a10 = '<:smidul:534147163303837707>',
    a11 = '<:spooky:508110801719001088>',
    a12 = '<:susco:451481098443030559>',
    a13 = '<:tablet:696483467852251176>',
    a14 = '<:update:593220375320723466>',
    a15 = '<:windows:696483467893932152>';

  if (emj.startsWith('.')) {
    var a0 = a0.replace(/<:|>/g, ''),
      a1 = a1.replace(/<:|>/g, ''),
      a2 = a2.replace(/<:|>/g, ''),
      a3 = a3.replace(/<:|>/g, ''),
      a4 = a4.replace(/<:|>/g, ''),
      a5 = a5.replace(/<:|>/g, ''),
      a6 = a6.replace(/<:|>/g, ''),
      a7 = a7.replace(/<:|>/g, ''),
      a8 = a8.replace(/<:|>/g, ''),
      a9 = a9.replace(/<:|>/g, ''),
      a10 = a10.replace(/<:|>/g, ''),
      a11 = a11.replace(/<:|>/g, ''),
      a12 = a12.replace(/<:|>/g, ''),
      a13 = a13.replace(/<:|>/g, ''),
      a14 = a14.replace(/<:|>/g, ''),
      a15 = a15.replace(/<:|>/g, '');
  }

  if (eR === 'android') return a0;
  if (eR === 'esquerdista') return a1;
  if (eR === 'esquerdista2') return a2;
  if (eR === 'fuck') return a3;
  if (eR === 'holyshit') return a4;
  if (eR === 'ios') return a5;
  if (eR === 'linux') return a6;
  if (eR === 'mac') return a7;
  if (eR === 'mememan') return a8;
  if (eR === 'neutral_sign') return a9;
  if (eR === 'smidul') return a10;
  if (eR === 'spooky') return a11;
  if (eR === 'susco') return a12;
  if (eR === 'tablet') return a13;
  if (eR === 'update') return a14;
  if (eR === 'windows') return a15;
};
