export const botOwners = ['205130563424616450', '204761318434144256'],
  colors = {
    blue: 0x0000ff,
    blurple: 0x5865f2,
    green: 0x00ff00,
    orange: 0xff8000,
    red: 0xff0000,
    yellow: 0xffff00,
  },
  defaultLocale = 'en-US',
  emojis = {
    balance: '<:balance:905854888112717845>',
    bellRinging: '<a:bellRinging:947984870993449031>',
    boosting1Month: '<:boosting1Month:924750656965836810>',
    boosting2Months: '<:boosting2Months:924750713345695795>',
    boosting3Months: '<:boosting3Months:924750808438951946>',
    boosting6Months: '<:boosting6Months:924750894833233991>',
    boosting9Months: '<:boosting9Months:924750903905497118>',
    boosting12Months: '<:boosting12Months:924751032666439730>',
    boosting15Months: '<:boosting15Months:924751044246896710>',
    boosting18Months: '<:boosting18Months:924751052119617536>',
    bot: '<:bot:897893989217353839>',
    bravery: '<:bravery:905854890658631712>',
    brilliance: '<:brilliance:905854893863104533>',
    bugHunterLvl1: '<:bugHunterLvl1:905853531423113216>',
    bugHunterLvl2: '<:bugHunterLvl2:905853529133027370>',
    certifiedMod: '<:certifiedMod:905860415647514684>',
    channelText: '<:channelText:946211084212269086>',
    check: '<:check:977731447613968414>',
    commands: '<:commands:905797474017484851>',
    contextMenuCommand: '<:contextMenuCommand:936223463025311815>',
    crowdin: '<:crowdin:905984887499137046>',
    discordEmployee: '<:discordEmployee:905861867338092554>',
    discordJS: '<:discordJS:935945407861784647>',
    earlySupporter: '<:earlySupporter:905854247726362665>',
    earlyVerifiedBotDeveloper: '<:earlyVerifiedBotDeveloper:905854251027284099>',
    github: '<:github:950194684347678740>',
    hypeSquadEvents: '<:hypeSquadEvents:905860389496037429>',
    info: '<:info:955937218675998810>',
    maybe: '<:maybe:977731421743480842>',
    members: '<:members:935914663554744342>',
    mention: '<:mention:936453837735223318>',
    neutral: '<:neutral:977731431696592916>',
    new: '<:new:925058336259465257>',
    no: '<:no:977731439468634122>',
    nodeJS: '<:nodeJS:935945315918438540>',
    partneredServerOwner: '<:partneredServerOwner:905860411549700126>',
    ramMemory: '<:ramMemory:936093919001837599>',
    recordAudio: '<:recordAudio:945011244581154836>',
    role: '<:role:935915048314994698>',
    serverDiscovery: '<:serverDiscovery:936220037717585940>',
    serverJoin: '<:serverJoin:936261581510164570>',
    serverLeave: '<:serverLeave:936261583867379733>',
    serverOwner: '<:serverOwner:905860385675034634>',
    slashCommand: '<:slashCommand:936223463033688084>',
    support: '<:support:985276833350160406>',
    system: '<:system1:924741379412877423><:system2:924741379479982111>',
    teamUser: '<:teamUser:924748084636971059>',
    verified: '<:verified:905860422383595540>',
    verifiedBot: '<:verifiedBot1:897835099863805994><:verifiedBot2:897835100018978877>',
    verifiedSystem: '<:verifiedSystem1:924729386836578325><:verifiedSystem2:924729442025222174>',
  },
  premiumLimits = {
    0: { emojis: 50, stickers: 0 },
    1: { emojis: 100, stickers: 15 },
    2: { emojis: 150, stickers: 30 },
    3: { emojis: 250, stickers: 60 },
  },
  imgOpts = { format: 'png', size: 4096 },
  supportServer = { id: '420007989261500418', invite: 'https://discord.gg/f85rEGJ' },
  debugMode = 1,
  defaultSettings = {
    /**
     * @typedef {Object} guilds default settings for guilds
     * @prop {Object} [log] Bot logging settings
     * @prop {boolean} [log.badDomains] Whether to log messages containing bad domains
     * @prop {string} [log.channel] The id of the channel used to send log messages from the bot
     */
    guilds: { log: { badDomains: false, channel: null } },
    /**
     * @typedef {Object} reminders The default settings for users
     */
    reminders: {},
    /**
     * @typedef {Object} users The default settings for users
     * @prop {string} [locale] The users's set locale
     */
    users: { locale: null },
  };
