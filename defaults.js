export const botColor = '5865f2',
  botLanguage = {
    default: 'en-US',
    supported: ['en-US', 'es-ES', 'pt-BR'],
  },
  botOwners = ['205130563424616450', '204761318434144256'],
  emojis = {
    discordEmployee: '<:DiscordEmployee:905861867338092554>',
    serverOwner: '<:ServerOwner:905860385675034634>',
    partneredServerOwner: '<:PartneredServerOwner:905860411549700126>',
    hypeSquadEvents: '<:HypeSquadEvents:905860389496037429>',
    balance: '<:Balance:905854888112717845>',
    bravery: '<:Bravery:905854890658631712>',
    brilliance: '<:Brilliance:905854893863104533>',
    bugHunterLvl1: '<:BugHunterLvl1:905853531423113216>',
    bugHunterLvl2: '<:BugHunterLvl2:905853529133027370>',
    earlySupporter: '<:EarlySupporter:905854247726362665>',
    earlyVerifiedBotDeveloper: '<:EarlyVerifiedBotDeveloper:905854251027284099>',
    teamUser: '<:TeamUser:924748084636971059>',
    certifiedMod: '<:CertifiedMod:905860415647514684>',
    bot: '<:Bot:897893989217353839>',
    verifiedBot: '<:VerifiedBot1:897835099863805994><:VerifiedBot2:897835100018978877>',
    system: '<:System1:924741379412877423><:System2:924741379479982111>',
    verifiedSystem: '<:VerifiedSystem1:924729386836578325><:VerifiedSystem2:924729442025222174>',
    httpInteractions: '<:HttpInteractions:905797474017484851>',
    verified: '<:Verified:905860422383595540>',
    crowdin: '<:Crowdin:905984887499137046>',
    boosting1Month: '<:Boosting1Month:924750656965836810>',
    boosting2Months: '<:Boosting2Months:924750713345695795>',
    boosting3Months: '<:Boosting3Months:924750808438951946>',
    boosting6Months: '<:Boosting6Months:924750894833233991>',
    boosting9Months: '<:Boosting9Months:924750903905497118>',
    boosting12Months: '<:Boosting12Months:924751032666439730>',
    boosting15Months: '<:Boosting15Months:924751044246896710>',
    boosting18Months: '<:Boosting18Months:924751052119617536>',
  },
  imgOpts = { format: 'png', size: 4096, dynamic: true },
  supportServer = 'https://discord.gg/f85rEGJ',
  debugMode = true,
  /**
   * @typedef {Object} guildSettings The default settings for guilds
   * @prop {string} [language] The guild's language
   * @prop {Object} [log] Bot logging settings
   * @prop {boolean} [log.badDomains] Whether to log messages containing bad domains
   * @prop {string} [log.channel] The id of the channel used to send log messages from the bot
   */
  guildSettings = { language: botLanguage.default, log: { badDomains: false, channel: null } },
  /**
   * @typedef {Object} userSettings The default settings for users
   */
  userSettings = {};
