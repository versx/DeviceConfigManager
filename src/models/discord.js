'use strict';

const DiscordColors = {
    Default: 0,
    Aqua: 1752220,
    Green: 3066993,
    Blue: 3447003,
    Purple: 10181046,
    Gold: 15844367,
    Orange: 15105570,
    Red: 15158332,
    Grey: 9807270,
    DarkerGrey: 8359053,
    Navy: 3426654,
    DarkAqua: 1146986,
    DarkGreen: 2067276,
    DarkBlue: 2123412,
    DarkPurple: 7419530,
    DarkGold: 12745742,
    DarkOrange: 11027200,
    DarkRed: 10038562,
    DarkGrey: 9936031,
    LightGrey: 12370112,
    DarkNavy: 2899536,
    LuminousVividPink: 16580705,
    DarkVividPink: 12320855
};

class DiscordMessage {
    constructor(content, username, avatarUrl, embeds) {
        this.content = content;
        this.username = username;
        this.avatar_url = avatarUrl || '';
        this.embeds = embeds || [];
    }
}

class DiscordEmbed {
    constructor(title, description, thumbnail, image, url, color = 0) {
        this.title = title || '';
        this.description = description || '';
        this.color = color || 0;
        this.thumbnail = thumbnail || '';
        this.image = image || '';
        this.url = url || '';
    }

    addAuthor(name, iconUrl) {
        this.author = new DiscordEmbedAuthor(name, iconUrl || '');
    }

    addFooter(text, iconUrl) {
        this.footer = new DiscordEmbedFooter(text, iconUrl || '');
    }

    /*
    addField(name, value, inline = false) {
        if (!this.fields) {
            this.fields = [];
        }
        this.fields.push(new DiscordEmbedField(name, value, inline));
    }

    static createField(name, value, inline = false) {
        return new DiscordEmbedField(name, value, inline);
    }
    */

    static createBasicEmbed(title, content, color = 0) {
        return new DiscordEmbed(title, content, null, null, null, color);
    }

    static createAdvancedEmbed(title, content, thumbnail = '', image = '', color = 0) {
        return new DiscordEmbed(title, content, thumbnail, image, null, color);
    }
}

class DiscordEmbedAuthor {
    constructor(name, iconUrl) {
        this.name = name;
        this.icon_url = iconUrl;
    }
}

class DiscordEmbedFooter {
    constructor(text, iconUrl) {
        this.text = text;
        this.icon_url = iconUrl;
    }
}

class DiscordEmbedField {
    constructor(name, value, inline = false) {
        this.name = name;
        this.value = value;
        this.inline = inline;
    }
}

class DiscordEmbedImage {
    constructor(url) {
        this.url = url;
    }
}

module.exports = {
    DiscordMessage,
    DiscordEmbed,
    DiscordEmbedAuthor,
    DiscordEmbedFooter,
    DiscordEmbedField,
    DiscordEmbedImage,
    DiscordColors,
};

/*
{
    "content": "",
    "username": "",
    "avatar_url": "",
    "embeds": [{
        "title": "",
        "description": "",
        "color": "",
        "author": {
            "name": "",
            "icon_url": ""
        },
        "fields": [{
            "name": "",
            "value": "",
            "inline": ""
        }],
        "footer": {
            "text": "",
            "icon_url": ""
        },
        "thumbnail": {
            "url": ""
        },
        "image": {
            "url": ""
        },
        "url": ""
    }]
}
*/