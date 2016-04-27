import BaseCommand from '../../base/BaseCommand'
import request from 'superagent'

class AnimeCommand extends BaseCommand {
  static get name () {
    return 'anime'
  }

  static get description () {
    return 'Does anime-related things'
  }

  static get usage () {
    return [
      'search <anime title> - Finds an anime'
    ]
  }

  handle () {
    this.responds(/^anime$/i, () => {
      this.wrongUsage('anime')
    })

    this.responds(/^anime search$/i, () => {
      this.wrongUsage('anime')
    })

    this.responds(/^anime search (.+)$/i, matches => {
      let query = matches[1].split(' ').join('_')
      request
      .get(`http://hummingbird.me/api/v1/search/anime?query=${query}`)
      .end((err, res) => {
        if (err) {
          this.logger.error(`Error finding anime with query ${query}`, err)
        }
        let result = res.body[0]
        if (typeof res.body[0] === 'undefined') {
          return this.reply(
            'The show you\'re searching for doesn\'t exist ' +
            'in Hummingbird\'s databases.'
          )
        }
        return this.send(this.channel, [
          '```xl',
          `NAME: ${result.title} (ID ${result.id})`,
          `${result.alternate_title
            ? `ALT: ${result.alternate_title}`
            : ' '}`,
          `STATUS: ${result.status}`,
          `EPISODES: ${result.episode_count}`,
          `COVER: ${result.cover_image}`,
          '```',
          `__Synopsis__`,
          result.synopsis
        ].join('\n'))
      })
    })
  }
}

module.exports = AnimeCommand
