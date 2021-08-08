const Discord = require('discord.js')
const db = require('quick.db')
const { default_prefix } = require("../../config.json");
const { color } = require("../../config.json");

module.exports = {
  name: "antiinvite",

  run: async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send({ embed: { color: "efa23a", description: `${warn} ${message.author}: You're **missing** permission: \`manage_guild\`` } });
    if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.channel.send({ embed: { color: "efa23a", description: `${warn} ${message.author}: I'm **missing** permission: \`manage_messages\`` } });

    const [type, ...value1] = args
    if(value1) { 
      var value = value1.join(' ') 
    }
    const invite = db.get(`invite_${message.guild.id}`)
    if(!type) {
      if(!invite) return message.channel.send("This guild's anti invites is disabled")
      else {
        let e = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`${message.guild.name}'s anti invites`)
        .addField("Action", invite.action)
        if(invite.ignore) {
        e.addField("Ignore channels", !invite.ignore.length < 1 ? invite.ignore.map(m => `<#${m}>`).join(', ') : "No channel")
        }
              if(invite.roleignore) e.addField("Ignore roles", !invite.roleignore.length  < 1 ? invite.roleignore.map(m => `<@&${m}>`).join(', ') : "No ignore roles")
        return message.channel.send(e)
      }
    } else if(type == "action") {
      if(!value) return message.channel.send("Please use `;antiinvite action <delete/warn/mute/kick/ban>`")
      else {
        if(value == "mute" || value == "kick" || value == "ban" || value == "delete" || value == "warn") {
          db.set(`invite_${message.guild.id}.action`, value)
          message.channel.send("Set!")
          return
        } else {
          return message.channel.send("Please use `;antiinvite action <delete/warn/mute/kick/ban>`")
        }
      }
    } else if(type == "disable") {
      if(!invite) return message.channel.send("This module has already disabled. If you want to enable it, use `;antiinvite enable`")
      else {
        db.delete(`invite_${message.guild.id}`)
        return message.channel.send("This module has been disabled!")
      }
    }  else if(type == "enable") {
      if(invite) return message.channel.send("This module has already enabled. If you want to enable it, use `;antiinvite disable`")
      else {
        db.set(`invite_${message.guild.id}.action`, "kick")
        return message.channel.send("This module has been enabled, but the action has been set to default (`kick`)!")
      }
    } else if(type == "ignore") {
      if(!value) return message.channel.send("Please use `;antiinvite ignore <channel's name or ID>`")
      else {
        let a = message.guild.channels.cache.get(m => m.name == value || m.id == value)
        if(!a) return message.channel.send("Ops, I cannot find a channel!")
        else{
          db.push(`invite_${message.guild.id}.ignore`, a.id)
          return message.channel.send("Added a channel!")
        }
      }
    } else if (type == "unignore") {
      if(!value) return message.channel.send("Please use `;antiinvite ignore <channel's name or ID>`")
      else {
        let a = message.guild.channels.cache.get(m => m.name == value|| m.id == value)
        if(!a) return message.channel.send("Ops, I cannot find a channel!")
        else{
          let n = invite.ignore.find(m => m == a.id)
          if(!n) return message.channel.send("That channel is already removed")
          db.set(`invite_${message.guild.id}.ignore`, !invite.ignore.length == 1 ? invite.ignore.splice(invite.ignore.indexOf(a.id) ,1 ) : [])
          return message.channel.send("Removed a channel!")
        }
      }
    }
  }
}