/*!
 * express-useragent.js v1.0.15 (https://github.com/biggora/express-useragent/)
 * Copyright 2011-2020 Aleksejs Gordejevs
 * Licensed under MIT (https://github.com/biggora/express-useragent/blob/master/README.md#license)
 */

const BotNames = [
  '\\+https:\\/\\/developers.google.com\\/\\+\\/web\\/snippet\\/',
  'ad\\smonitoring',
  'adsbot',
  'apex',
  'applebot',
  'archive.org_bot',
  'baiduspider',
  'bingbot',
  'chromeheadless',
  'cloudflare',
  'cloudinary',
  'crawler',
  'curl',
  'discordbot',
  'duckduckbot',
  'embedly',
  'exabot',
  'facebookexternalhit',
  'facebot',
  'flipboard',
  'google',
  'googlebot',
  'gsa-crawler',
  'gurujibot',
  'guzzlehttp',
  'heritrix',
  'ia_archiver',
  'insights',
  'linkedinbot',
  'ltx71',
  'mediapartners',
  'msnbot',
  'odklbot',
  'phantom\\.js',
  'phantomjs',
  'pingdom',
  'pinterest',
  'python',
  'rtlnieuws',
  'skypeuripreview',
  'slackbot',
  'slurp',
  'spbot',
  'telegrambot',
  'test\\scertificate',
  'testing',
  'tiabot',
  'tumblr ',
  'twitterbot',
  'vkshare',
  'web\\sscraper',
  'wget',
  'yandexbot',
  'whatsapp',
  'orangebot',
  'smtbot',
  'qwantify',
  'mj12bot',
  'ahrefsbot',
  'seznambot',
  'panscient.com',
  'duckduckgo-favicons-bot',
  'uptimerobot',
  'semrushbot',
  'postman',
  'dotbot',
  'zoominfobot',
  'ifttt',
  'sogou',
  'ru_bot',
  'researchscan',
  'nimbostratus-bot',
  'slack-imgproxy',
  'node-superagent',
  'go-http-client',
  'jersey',
  'dataprovider.com',
  'github-camo',
  'dispatch',
  'checkmarknetwork',
  'screaming frog',
  'whatweb',
  'daum',
  'netcraftsurveyagent',
  'mojeekbot',
  'surdotlybot',
  'springbot',
];

const BrowserVersions = {
  Edge: /(?:edge|edga|edgios|edg)\/([\d\w.-]+)/i,
  Firefox: /(?:firefox|fxios)\/([\d\w.-]+)/i,
  IE: /msie\s([\d.]+[\d])|trident\/\d+.d+;.*[rv:]+(\d+.d)/i,
  Chrome: /(?:chrome|crios)\/([\d\w.-]+)/i,
  Chromium: /chromium\/([\d\w.-]+)/i,
  Safari: /(version|safari)\/([\d\w.-]+)/i,
  Opera: /version\/([\d\w.-]+)|OPR\/([\d\w.-]+)/i,
  Ps3: /([\d\w.-]+)\)\s*$/i,
  Psp: /([\d\w.-]+)\)?\s*$/i,
  Amaya: /amaya\/([\d\w.-]+)/i,
  SeaMonkey: /seamonkey\/([\d\w.-]+)/i,
  OmniWeb: /omniweb\/v([\d\w.-]+)/i,
  Flock: /flock\/([\d\w.-]+)/i,
  Epiphany: /epiphany\/([\d\w.-]+)/i,
  WinJs: /msapphost\/([\d\w.-]+)/i,
  PhantomJS: /phantomjs\/([\d\w.-]+)/i,
  AlamoFire: /alamofire\/([\d\w.-]+)/i,
  UC: /ucbrowser\/([\d\w.]+)/i,
  Facebook: /FBAV\/([\d\w.]+)/i,
  WebKit: /applewebkit\/([\d\w.]+)/i,
  Wechat: /micromessenger\/([\d\w.]+)/i,
  Electron: /Electron\/([\d\w.]+)/i,
};

const Browsers = {
  YaBrowser: /yabrowser/i,
  Edge: /edge|edga|edgios|edg/i,
  Amaya: /amaya/i,
  Konqueror: /konqueror/i,
  Epiphany: /epiphany/i,
  SeaMonkey: /seamonkey/i,
  Flock: /flock/i,
  OmniWeb: /omniweb/i,
  Chromium: /chromium/i,
  Chrome: /chrome|crios/i,
  Safari: /safari/i,
  IE: /msie|trident/i,
  Opera: /opera|OPR\//i,
  PS3: /playstation 3/i,
  PSP: /playstation portable/i,
  Firefox: /firefox|fxios/i,
  WinJs: /msapphost/i,
  PhantomJS: /phantomjs/i,
  AlamoFire: /alamofire/i,
  UC: /UCBrowser/i,
  Facebook: /FBA[NV]/,
};

const OS = {
  Windows11: /windows nt 11\.0/i,
  Windows10: /windows nt 10\.0/i,
  Windows81: /windows nt 6\.3/i,
  Windows8: /windows nt 6\.2/i,
  Windows7: /windows nt 6\.1/i,
  UnknownWindows: /windows nt 6\.\d+/i,
  WindowsVista: /windows nt 6\.0/i,
  Windows2003: /windows nt 5\.2/i,
  WindowsXP: /windows nt 5\.1/i,
  Windows2000: /windows nt 5\.0/i,
  WindowsPhone81: /windows phone 8\.1/i,
  WindowsPhone80: /windows phone 8\.0/i,
  OSXCheetah: /os x 10[._]0/i,
  OSXPuma: /os x 10[._]1(\D|$)/i,
  OSXJaguar: /os x 10[._]2/i,
  OSXPanther: /os x 10[._]3/i,
  OSXTiger: /os x 10[._]4/i,
  OSXLeopard: /os x 10[._]5/i,
  OSXSnowLeopard: /os x 10[._]6/i,
  OSXLion: /os x 10[._]7/i,
  OSXMountainLion: /os x 10[._]8/i,
  OSXMavericks: /os x 10[._]9/i,
  OSXYosemite: /os x 10[._]10/i,
  OSXElCapitan: /os x 10[._]11/i,
  MacOSSierra: /os x 10[._]12/i,
  MacOSHighSierra: /os x 10[._]13/i,
  MacOSMojave: /os x 10[._]14/i,
  MacOSCatalina: /os x 10[._]15/i,
  MacOSBigSur: /os x 11[._]0/i,
  MacOSMonterey: /os x 12[._]0/i,
  MacOSVentura: /os x 13[._]0/i,
  Mac: /os x/i,
  Linux: /linux/i,
  Linux64: /linux x86_64/i,
  ChromeOS: /cros/i,
  Wii: /wii/i,
  PS3: /playstation 3/i,
  PSP: /playstation portable/i,
  iPad: /\(iPad.*os (\d+)[._](\d+)/i,
  iPhone: /\(iPhone.*os (\d+)[._](\d+)/i,
  iOS: /ios/i,
  Bada: /Bada\/(\d+)\.(\d+)/i,
  Curl: /curl\/(\d+)\.(\d+)\.(\d+)/i,
  Electron: /Electron\/(\d+)\.(\d+)\.(\d+)/i,
};

const Platforms = {
  Windows: /windows nt/i,
  WindowsPhone: /windows phone/i,
  Mac: /macintosh/i,
  Linux: /linux/i,
  Wii: /wii/i,
  Playstation: /playstation/i,
  iPad: /ipad/i,
  iPod: /ipod/i,
  iPhone: /iphone/i,
  Android: /android/i,
  Blackberry: /blackberry/i,
  Samsung: /samsung/i,
  Curl: /curl/i,
  Electron: /Electron/i,
  iOS: /^ios-/i,
};

const DefaultAgent = {
  isYaBrowser: false,
  isAuthoritative: true,
  isMobile: false,
  isMobileNative: false,
  isTablet: false,
  isiPad: false,
  isiPod: false,
  isiPhone: false,
  isiPhoneNative: false,
  isAndroid: false,
  isAndroidNative: false,
  isBlackberry: false,
  isOpera: false,
  isIE: false,
  isEdge: false,
  isIECompatibilityMode: false,
  isSafari: false,
  isFirefox: false,
  isWebkit: false,
  isChrome: false,
  isKonqueror: false,
  isOmniWeb: false,
  isSeaMonkey: false,
  isFlock: false,
  isAmaya: false,
  isPhantomJS: false,
  isEpiphany: false,
  isDesktop: false,
  isWindows: false,
  isLinux: false,
  isLinux64: false,
  isMac: false,
  isChromeOS: false,
  isBada: false,
  isSamsung: false,
  isRaspberry: false,
  isBot: false,
  isCurl: false,
  isAndroidTablet: false,
  isWinJs: false,
  isKindleFire: false,
  isSilk: false,
  isCaptive: false,
  isSmartTV: false,
  isUC : false,
  isFacebook : false,
  isAlamoFire: false,
  isElectron: false,
  silkAccelerated: false,
  browser: 'Unknown',
  version: 'Unknown',
  os: 'Unknown',
  platform: 'Unknown',
  geoIp: {},
  source: '',
  isWechat: false,
};

const IsBotRegExp = new RegExp('^.*(' + BotNames.join('|') + ').*$');

export class UserAgentParser {
  private agent: any;
  private isWebkit: boolean = false;

  public userAgent: string;
  public os: string = 'Unknown';
  public platform: string = 'Unknown';
  public browser: string = 'Unknown';
  public version: string = 'Unknown';

  constructor(userAgent: string) {
    this.userAgent = userAgent;
    this.agent = DefaultAgent;
  }

  public parse() {
    //this.source = this.userAgent.replace(/^\s*/, '').replace(/\s*$/, '');
    this.os = this.getOS();
    this.platform = this.getPlatform();
    this.browser = this.getBrowser();
    this.version = this.getBrowserVersion()!;
    this.agent.electronVersion = this.getElectronVersion();
    this.testBot();
    this.testSmartTV();
    this.testMobile();
    this.testAndroidTablet();
    this.testTablet();
    this.testCompatibilityMode();
    this.testSilk();
    this.testKindleFire();
    this.testCaptiveNetwork();
    this.testWebkit();
    this.testWechat();
    return this;
  }

  public reset() {
    const agent: any = DefaultAgent;
    for (const key in agent) {
      this.agent[key] = agent[key];
    }
    return this.agent;
  }

  private getBrowserVersion() {
    let regex;
    switch (this.browser) {
      case 'Edge':
        if (BrowserVersions.Edge.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'PhantomJS':
        if (BrowserVersions.PhantomJS.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'Chrome':
        if (BrowserVersions.Chrome.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'Chromium':
        if (BrowserVersions.Chromium.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'Safari':
        if (BrowserVersions.Safari.test(this.userAgent)) {
          return RegExp.$2;
        }
        break;
      case 'Opera':
        if (BrowserVersions.Opera.test(this.userAgent)) {
          return RegExp.$1 ? RegExp.$1: RegExp.$2;
        }
        break;
      case 'Firefox':
        if (BrowserVersions.Firefox.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'WinJs':
        if (BrowserVersions.WinJs.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'IE':
        if (BrowserVersions.IE.test(this.userAgent)) {
          return RegExp.$2 ? RegExp.$2 : RegExp.$1;
        }
        break;
      case 'ps3':
        if (BrowserVersions.Ps3.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'psp':
        if (BrowserVersions.Psp.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'Amaya':
        if (BrowserVersions.Amaya.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'Epiphany':
        if (BrowserVersions.Epiphany.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'SeaMonkey':
        if (BrowserVersions.SeaMonkey.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'Flock':
        if (BrowserVersions.Flock.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'OmniWeb':
        if (BrowserVersions.OmniWeb.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'UCBrowser':
        if (BrowserVersions.UC.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      case 'Facebook':
        if (BrowserVersions.Facebook.test(this.userAgent)) {
          return RegExp.$1;
        }
        break;
      default:
        if (this.browser !== 'Unknown') {
          regex = new RegExp(this.browser + '[\\/ ]([\\d\\w\\.\\-]+)', 'i');
          if (regex.test(this.userAgent)) {
            return RegExp.$1;
          }
        } else {
          this.testWebkit();
          if (this.isWebkit && BrowserVersions.WebKit.test(this.userAgent)) {
            return RegExp.$1;
          }
          return 'Unknown';
        }
    }
  }

  private getBrowser() {
    switch (true) {
      case Browsers.YaBrowser.test(this.userAgent):
        this.agent.isYaBrowser = true;
        return 'YaBrowser';
      case Browsers.AlamoFire.test(this.userAgent):
        this.agent.isAlamoFire = true;
        return 'AlamoFire';
      case Browsers.Edge.test(this.userAgent):
        this.agent.isEdge = true;
        return 'Edge';
      case Browsers.PhantomJS.test(this.userAgent):
        this.agent.isPhantomJS = true;
        return 'PhantomJS';
      case Browsers.Konqueror.test(this.userAgent):
        this.agent.isKonqueror = true;
        return 'Konqueror';
      case Browsers.Amaya.test(this.userAgent):
        this.agent.isAmaya = true;
        return 'Amaya';
      case Browsers.Epiphany.test(this.userAgent):
        this.agent.isEpiphany = true;
        return 'Epiphany';
      case Browsers.SeaMonkey.test(this.userAgent):
        this.agent.isSeaMonkey = true;
        return 'SeaMonkey';
      case Browsers.Flock.test(this.userAgent):
        this.agent.isFlock = true;
        return 'Flock';
      case Browsers.OmniWeb.test(this.userAgent):
        this.agent.isOmniWeb = true;
        return 'OmniWeb';
      case Browsers.Opera.test(this.userAgent):
        this.agent.isOpera = true;
        return 'Opera';
      case Browsers.Chromium.test(this.userAgent):
        this.agent.isChrome = true;
        return 'Chromium';
      case Browsers.Facebook.test(this.userAgent):
        this.agent.isFacebook = true;
        return 'Facebook';
      case Browsers.Chrome.test(this.userAgent):
        this.agent.isChrome = true;
        return 'Chrome';
      case Browsers.WinJs.test(this.userAgent):
        this.agent.isWinJs = true;
        return 'WinJs';
      case Browsers.IE.test(this.userAgent):
        this.agent.isIE = true;
        return 'IE';
      case Browsers.Firefox.test(this.userAgent):
        this.agent.isFirefox = true;
        return 'Firefox';
      case Browsers.Safari.test(this.userAgent):
        this.agent.isSafari = true;
        return 'Safari';
      case Browsers.PS3.test(this.userAgent):
        return 'ps3';
      case Browsers.PSP.test(this.userAgent):
        return 'psp';
      case Browsers.UC.test(this.userAgent):
        this.agent.isUC = true;
        return 'UCBrowser';
      default:
        if (this.userAgent.indexOf('Dalvik') !== -1) {
          return 'Unknown';
        }

        // If the UA does not start with Mozilla guess the user this.agent.
        if (this.userAgent.indexOf('Mozilla') !== 0 && /^([\d\w\-.]+)\/[\d\w.-]+/i.test(this.userAgent)) {
          this.agent.isAuthoritative = false;
          return RegExp.$1;
        }
        return 'Unknown';
    }
  }

  private getOS() {
    switch (true) {
      case OS.WindowsVista.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows Vista';
      case OS.Windows7.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows 7';
      case OS.Windows8.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows 8';
      case OS.Windows81.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows 8.1';
      case OS.Windows10.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows 10';
      case OS.Windows11.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows 11';
      case OS.Windows2003.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows 2003';
      case OS.WindowsXP.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows XP';
      case OS.Windows2000.test(this.userAgent):
        this.agent.isWindows = true;
        return 'Windows 2000';
      case OS.WindowsPhone81.test(this.userAgent):
        this.agent.isWindowsPhone = true;
        return 'Windows Phone 8.1';
      case OS.WindowsPhone80.test(this.userAgent):
        this.agent.isWindowsPhone = true;
        return 'Windows Phone 8.0';
      case OS.Linux64.test(this.userAgent):
        this.agent.isLinux = true;
        this.agent.isLinux64 = true;
        return 'Linux 64';
      case OS.Linux.test(this.userAgent):
        this.agent.isLinux = true;
        return 'Linux';
      case OS.ChromeOS.test(this.userAgent):
        this.agent.isChromeOS = true;
        return 'Chrome OS';
      case OS.Wii.test(this.userAgent):
        return 'Wii';
      case OS.PS3.test(this.userAgent):
        return 'Playstation';
      case OS.PSP.test(this.userAgent):
        return 'Playstation';
      case OS.OSXCheetah.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Cheetah';
      case OS.OSXPuma.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Puma';
      case OS.OSXJaguar.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Jaguar';
      case OS.OSXPanther.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Panther';
      case OS.OSXTiger.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Tiger';
      case OS.OSXLeopard.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Leopard';
      case OS.OSXSnowLeopard.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Snow Leopard';
      case OS.OSXLion.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Lion';
      case OS.OSXMountainLion.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Mountain Lion';
      case OS.OSXMavericks.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Mavericks';
      case OS.OSXYosemite.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X Yosemite';
      case OS.OSXElCapitan.test(this.userAgent):
        this.agent.isMac = true;
        return 'OS X El Capitan';
      case OS.MacOSSierra.test(this.userAgent):
        this.agent.isMac = true;
        return 'macOS Sierra';
      case OS.MacOSHighSierra.test(this.userAgent):
        this.agent.isMac = true;
        return 'macOS High Sierra';
      case OS.MacOSMojave.test(this.userAgent):
        this.agent.isMac = true;
        return 'macOS Mojave';
      case OS.MacOSCatalina.test(this.userAgent):
        this.agent.isMac = true;
        return 'macOS Catalina';
      case OS.MacOSBigSur.test(this.userAgent):
        this.agent.isMac = true;
        return 'macOS Big Sur';
      case OS.MacOSMonterey.test(this.userAgent):
        this.agent.isMac = true;
        return 'macOS Monterey';
      case OS.MacOSVentura.test(this.userAgent):
        this.agent.isMac = true;
        return 'macOS Ventura';
      case OS.Mac.test(this.userAgent):
        // !('ontouchend' in document);
        // navigator.maxTouchPoints > 1
        this.agent.isMac = true;
        return 'OS X';
      case OS.iPad.test(this.userAgent):
        // 'ontouchend' in document;
        this.agent.isiPad = true;
        return this.userAgent.match(OS.iPad)![0].replace('_', '.');
      case OS.iPhone.test(this.userAgent):
        //  'ontouchend' in document;
        this.agent.isiPhone = true;
        return this.userAgent.match(OS.iPhone)![0].replace('_', '.');
      case OS.Bada.test(this.userAgent):
        this.agent.isBada = true;
        return 'Bada';
      case OS.Curl.test(this.userAgent):
        this.agent.isCurl = true;
        return 'Curl';
      case OS.iOS.test(this.userAgent):
        this.agent.isiPhone = true;
        return 'iOS';
      case OS.Electron.test(this.userAgent):
        this.agent.isElectron = true;
        return 'Electron';
      default:
        return 'Unknown';
    }
  }

  public getPlatform() {
    switch (true) {
      case Platforms.Windows.test(this.userAgent):
        //return 'Microsoft Windows';
        return 'Windows';
      case Platforms.WindowsPhone.test(this.userAgent):
        this.agent.isWindowsPhone = true;
        //return 'Microsoft Windows Phone';
        return 'Windows Phone';
      case Platforms.Mac.test(this.userAgent):
        //return 'Apple Mac';
        return 'macOS';
      case Platforms.Curl.test(this.userAgent):
        return 'Curl';
      case Platforms.Electron.test(this.userAgent):
        this.agent.isElectron = true;
        return 'Electron';
      case Platforms.Android.test(this.userAgent):
        this.agent.isAndroid = true;
        return 'Android';
      case Platforms.Blackberry.test(this.userAgent):
        this.agent.isBlackberry = true;
        return 'Blackberry';
      case Platforms.Linux.test(this.userAgent):
        return 'Linux';
      case Platforms.Wii.test(this.userAgent):
        return 'Wii';
      case Platforms.Playstation.test(this.userAgent):
        return 'Playstation';
      case Platforms.iPad.test(this.userAgent):
        this.agent.isiPad = true;
        return 'iPad';
      case Platforms.iPod.test(this.userAgent):
        this.agent.isiPod = true;
        return 'iPod';
      case Platforms.iPhone.test(this.userAgent):
        this.agent.isiPhone = true;
        return 'iPhone';
      case Platforms.Samsung.test(this.userAgent):
        this.agent.isSamsung = true;
        return 'Samsung';
      case Platforms.iOS.test(this.userAgent):
        return 'iOS';
      default:
        return 'Unknown';
    }
  }

  private testBot() {
    var isBot = IsBotRegExp.exec(this.userAgent.toLowerCase());
    if (isBot) {
      this.agent.isBot = isBot[1];
    } else if (!this.agent.isAuthoritative) {
      // Test unauthoritative parse for `bot` in UA to flag for bot
      this.agent.isBot = /bot/i.test(this.userAgent);
    }
  }

  private testAndroidTablet() {
    if (this.agent.isAndroid && !/mobile/i.test(this.userAgent)) {
      this.agent.isAndroidTablet = true;
    }
  }

  private testMobile() {
    switch (true) {
      case this.agent.isWindows:
      case this.agent.isLinux:
      case this.agent.isMac:
      case this.agent.isChromeOS:
        this.agent.isDesktop = true;
        break;
      case this.agent.isAndroid:
      case this.agent.isSamsung:
        this.agent.isMobile = true;
        break;
      default:
    }
    switch (true) {
      case this.agent.isiPad:
      case this.agent.isiPod:
      case this.agent.isiPhone:
      case this.agent.isBada:
      case this.agent.isBlackberry:
      case this.agent.isAndroid:
      case this.agent.isWindowsPhone:
        this.agent.isMobile = true;
        this.agent.isDesktop = false;
        break;
      default:
    }
    if (/mobile|^ios-/i.test(this.userAgent)) {
      this.agent.isMobile = true;
      this.agent.isDesktop = false;
    }
    if (/dalvik/i.test(this.userAgent)) {
      this.agent.isAndroidNative = true;
      this.agent.isMobileNative = true;
    }
    if (/scale/i.test(this.userAgent)) {
      this.agent.isiPhoneNative = true;
      this.agent.isMobileNative = true;
    }
  }

  private testTablet() {
    switch (true) {
      case this.agent.isiPad:
      case this.agent.isAndroidTablet:
      case this.agent.isKindleFire:
        this.agent.isTablet = true;
        break;
      default:
        break;
    }
    if (/tablet/i.test(this.userAgent)) {
      this.agent.isTablet = true;
    }
  }

  private testNginxGeoIP(headers: any) {
    Object.keys(headers).forEach((key) => {
      if (/^GEOIP/i.test(key)) {
        this.agent.geoIp[key] = headers[key];
      }
    });
    return this.agent;
  }

  private getWechatVersion() {
    if (BrowserVersions.Wechat.test(this.userAgent)) {
      return RegExp.$1;
    }
    return 'Unknown';
  }

  private getElectronVersion() {
    if (BrowserVersions.Electron.test(this.userAgent)) {
      this.agent.isElectron = true;
      return RegExp.$1;
    }
    return '';
  }

  private testCompatibilityMode() {
    if (!this.agent.isIE) {
      return;
    }

    if (/Trident\/(\d)\.0/i.test(this.userAgent)) {
      return;
    }

    let tridentVersion = parseInt(RegExp.$1, 10);
    let version = parseInt(this.agent.version, 10);
    if (version === 7 && tridentVersion === 7) {
      this.agent.isIECompatibilityMode = true;
      this.agent.version = 11.0;
    }

    if (version === 7 && tridentVersion === 6) {
      this.agent.isIECompatibilityMode = true;
      this.agent.version = 10.0;
    }

    if (version === 7 && tridentVersion === 5) {
      this.agent.isIECompatibilityMode = true;
      this.agent.version = 9.0;
    }

    if (version === 7 && tridentVersion === 4) {
      this.agent.isIECompatibilityMode = true;
      this.agent.version = 8.0;
    }
  }

  private testSilk() {
    switch (true) {
      case new RegExp('silk', 'gi').test(this.userAgent):
        this.agent.isSilk = true;
        break;
      default:
    }

    if (/Silk-Accelerated=true/gi.test(this.userAgent)) {
      this.agent.SilkAccelerated = true;
    }
    return this.agent.isSilk ? 'Silk' : false;
  }

  private testKindleFire() {
    switch (true) {
      case /KFOT/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire';
      case /KFTT/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HD';
      case /KFJWI/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HD 8.9';
      case /KFJWA/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HD 8.9 4G';
      case /KFSOWI/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HD 7';
      case /KFTHWI/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HDX 7';
      case /KFTHWA/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HDX 7 4G';
      case /KFAPWI/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HDX 8.9';
      case /KFAPWA/gi.test(this.userAgent):
        this.agent.isKindleFire = true;
        return 'Kindle Fire HDX 8.9 4G';
      default:
        return false;
    }
  }

  private testCaptiveNetwork() {
    switch (true) {
      case /CaptiveNetwork/gi.test(this.userAgent):
        this.agent.isCaptive = true;
        this.agent.isMac = true;
        this.agent.platform = 'Apple Mac';
        return 'CaptiveNetwork';
      default:
        return false;
    }
  }

  private testSmartTV() {
    this.testBot();
    this.agent.isSmartTV = new RegExp('smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast.tv','gi').test(this.userAgent.toLowerCase());
  }

  private testWebkit() {
    if (this.agent.browser === 'Unknown' && /applewebkit/i.test(this.userAgent)) {
      this.agent.browser = 'Apple WebKit';
      this.agent.isWebkit = true;
    }
  }

  private testWechat() {
    if (/micromessenger/i.test(this.userAgent)) {
      this.agent.isWechat = true;
      this.agent.version = this.getWechatVersion();
    }
  }
};