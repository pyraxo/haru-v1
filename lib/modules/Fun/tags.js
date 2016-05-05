import BaseCommand from '../../base/BaseCommand'
import Manager from '../../base/Database'
import _ from 'lodash'
import path from 'path'

class Tags extends BaseCommand {
  static get name () {
    return 'tags'
  }

  static get description () {
    return 'Command for custom tags'
  }

  static get usage () {
    return [
      'add <tag> <text> - Creates a tag with the text',
      'del <tag> - Deletes the tag'
    ]
  }

  replaceString (string) {
    let replacements = {
      '%sender%': this.sender.username,
      '%server%': this.server.name,
      '%channel%': this.channel.name
    }
    for (let str in replacements) {
      if (replacements.hasOwnProperty(str)) {
        string = string.replace(str, replacements[str])
      }
    }
    return string
  }

  handle () {
    this.manager = new Manager(path.join(process.cwd(), 'db/tags.json'))
    this.responds(/^tags$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (create|add|\+)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (create|add|\+) (\S+)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (create|add|\+) (\S+) ((.|\n)+)$/i, matches => {
      if (this.manager.set(matches[2], matches[3])) {
        this.send(
          this.channel,
          `:white_check_mark:  Created tag **${matches[2]}** ` +
          `with text: ${matches[3]}`
        )
      } else {
        this.reply(`The tag **${matches[2]}** already exists.`)
      }
    })

    this.responds(/^tags (edit|\>)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (edit|\>) (\S+)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (edit|\>) (\S+) ((.|\n)+)$/i, matches => {
      if (this.manager.del(matches[2])) {
        this.manager.set(matches[2], matches[3])
        this.send(
          this.channel,
          `:white_check_mark:  Edited tag **${matches[2]}** ` +
          `to text: ${matches[3]}.`
        )
      } else {
        this.reply(`The tag **${matches[2]}** does not exist.`)
      }
    })

    this.responds(/^tags (del|remove|rm|\-)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (del|remove|rm|\-) (\S+)$/i, matches => {
      if (this.manager.del(matches[2])) {
        this.send(
          this.channel,
          `:white_check_mark:  Deleted tag **${matches[2]}**.`
        )
      } else {
        this.reply(`The tag **${matches[2]}** does not exist.`)
      }
    })

    this.responds(/^tags (list|l|\?)$/i, () => {
      let tags = this.manager.getAll()
      this.reply([
        '```',
        Object.keys(tags).join(', '),
        '```'
      ].join('\n'))
    })

    this.hears(/^>>(\S+)$/, matches => {
      let tags = this.manager.getAll()
      if (_.has(tags, matches[1])) {
        let reply = this.replaceString(tags[matches[1]])
        this.send(this.channel, reply)
      }
    })
  }
}

module.exports = Tags
