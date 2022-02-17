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
    balance: '<:Balance:905854888112717845>',
    boosting1Month: '<:Boosting1Month:924750656965836810>',
    boosting2Months: '<:Boosting2Months:924750713345695795>',
    boosting3Months: '<:Boosting3Months:924750808438951946>',
    boosting6Months: '<:Boosting6Months:924750894833233991>',
    boosting9Months: '<:Boosting9Months:924750903905497118>',
    boosting12Months: '<:Boosting12Months:924751032666439730>',
    boosting15Months: '<:Boosting15Months:924751044246896710>',
    boosting18Months: '<:Boosting18Months:924751052119617536>',
    bot: '<:Bot:897893989217353839>',
    bravery: '<:Bravery:905854890658631712>',
    brilliance: '<:Brilliance:905854893863104533>',
    bugHunterLvl1: '<:BugHunterLvl1:905853531423113216>',
    bugHunterLvl2: '<:BugHunterLvl2:905853529133027370>',
    certifiedMod: '<:CertifiedMod:905860415647514684>',
    commands: '<:Commands:905797474017484851>',
    contextMenuCommand: '<:ContextMenuCommand:936223463025311815>',
    crowdin: '<:Crowdin:905984887499137046>',
    discordEmployee: '<:DiscordEmployee:905861867338092554>',
    discordJS: '<:DiscordJS:935945407861784647>',
    earlySupporter: '<:EarlySupporter:905854247726362665>',
    earlyVerifiedBotDeveloper: '<:EarlyVerifiedBotDeveloper:905854251027284099>',
    hypeSquadEvents: '<:HypeSquadEvents:905860389496037429>',
    members: '<:Members:935914663554744342>',
    mention: '<:Mention:936453837735223318>',
    new: '<:New:925058336259465257>',
    nodeJS: '<:NodeJS:935945315918438540>',
    partneredServerOwner: '<:PartneredServerOwner:905860411549700126>',
    ramMemory: '<:RamMemory:936093919001837599>',
    role: '<:Role:935915048314994698>',
    serverDiscovery: '<:ServerDiscovery:936220037717585940>',
    serverJoin: '<:ServerJoin:936261581510164570>',
    serverLeave: '<:ServerLeave:936261583867379733>',
    serverOwner: '<:ServerOwner:905860385675034634>',
    slashCommand: '<:SlashCommand:936223463033688084>',
    system: '<:System1:924741379412877423><:System2:924741379479982111>',
    teamUser: '<:TeamUser:924748084636971059>',
    verified: '<:Verified:905860422383595540>',
    verifiedBot: '<:VerifiedBot1:897835099863805994><:VerifiedBot2:897835100018978877>',
    verifiedSystem: '<:VerifiedSystem1:924729386836578325><:VerifiedSystem2:924729442025222174>',
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
     * @prop {string} [locale] The guild's set locale
     * @prop {('auto' | 'guild' | 'user')} [localeType] Whether to use auto locale if response is non-ephemeral
     * @prop {Object} [log] Bot logging settings
     * @prop {boolean} [log.badDomains] Whether to log messages containing bad domains
     * @prop {string} [log.channel] The id of the channel used to send log messages from the bot
     */
    guilds: { locale: null, localeType: 'auto', log: { badDomains: false, channel: null } },
    /**
     * @typedef {Object} reminders The default settings for users
     */
    reminders: {},
    /**
     * @typedef {Object} users The default settings for users
     */
    users: {},
  };
