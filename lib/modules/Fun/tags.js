import _ from 'lodash'

import BaseCommand from '../../base/BaseCommand'
import manager from './.tags/TagsManager'

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
      manager.set(matches[2], matches[3], false, (err, data) => {
        if (err === 'Unable to overwrite existing key') {
          this.reply(`The tag **${matches[2]}** already exists.`)
          return
        } else if (err) {
          this.reply(`Unable to create tag **${matches[2]}**: **${err}**`)
          return
        }
        this.send(this.channel,
          `:white_check_mark:  Created tag **${matches[2]}** ` +
          `with text: ${data}`
        )
      })
    })

    this.responds(/^tags (edit|\>)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (edit|\>) (\S+)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (edit|\>) (\S+) ((.|\n)+)$/i, matches => {
      if (manager.has(matches[2])) {
        manager.set(matches[2], matches[3], true, (err, data) => {
          if (err) {
            this.reply(`Unable to edit tag **${matches[2]}**: **${err}**`)
            return
          }
          this.send(this.channel,
            `:white_check_mark:  Edited tag **${matches[2]}** ` +
            `to text: ${data}`
          )
        })
      } else {
        this.reply(`The tag **${matches[2]}** does not exist.`)
      }
    })

    this.responds(/^tags (del|remove|rm|\-)$/i, () => {
      this.wrongUsage('tags')
    })

    this.responds(/^tags (del|remove|rm|\-) (\S+)$/i, matches => {
      if (manager.has(matches[2])) {
        manager.del(matches[2], (err, data) => {
          if (err) {
            this.reply(`Unable to delete tag **${matches[2]}**: **${err}**`)
            return
          }
          this.send(
            this.channel,
            `:white_check_mark:  Deleted tag **${matches[2]}**.`
          )
        })
      } else {
        this.reply(`The tag **${matches[2]}** does not exist.`)
      }
    })

    this.responds(/^tags (list|l|\?)$/i, () => {
      let tags = manager.getAll()
      this.reply([
        '```',
        Object.keys(tags).join(', '),
        '```'
      ].join('\n'))
    })

    this.hears(/^>>(\S+)$/, matches => {
      let tag = manager.get(matches[1])
      if (typeof tag !== 'undefined') {
        this.send(this.channel, tag)
      }
    })
  }
}

module.exports = Tags
