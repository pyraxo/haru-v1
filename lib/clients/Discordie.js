import BaseClient from '../base/BaseClient'
import Discordie from 'discordie'
import chalk from 'chalk'
import _ from 'lodash'
import prettyjson from 'prettyjson'
import request from 'superagent'
import ytdl from 'ytdl-core'

import Stream from './.music/Stream'
import YoutubeTrack from './.music/YoutubeTrack'
import SoundcloudTrack from './.music/SoundcloudTrack'

class Disco extends BaseClient {
  constructor (container) {
    super(container)
    this.streams = {}
    this.logger = container.get('logger')
  }

  get name () {
    return 'discordie'
  }

  // Commands

  prettify (content, id, prefix) {
    return _.trim(content.replace(
      new RegExp(`^(<@${id}>)|(\\${prefix})`), ''
    ))
  }

  isBotMentioned (user, msg, prefix) {
    return msg.content.indexOf(prefix) === 0 ||
      user.isMentioned(msg) ||
      !msg.guild
  }

  send (channel, content) {
    let msgRem = ''
    if (content.length > 20000) {
      return this.logger.error(
        'Error sending a message larger than the character and rate limit\n' +
        content
      )
    }
    if (content.length > 2000) {
      content = content.match(/.{1,20000}/g)
      msgRem = content.shift()
      content = content.join('')
    }
    return new Promise((res, rej) => {
      channel.sendMessage(content)
      .then(msg => {
        if (msgRem) {
          return this.send(channel, content)
            .then(msg => {
              return res(Array.isArray(msg) ? msg.concat(msg) : [msg])
            })
            .catch(rej)
        }
        res(msg)
      })
      .catch(rej)
    })
  }

  reply (msg, content) {
    return new Promise((res, rej) => {
      msg.reply(content)
      .then(res)
      .catch(rej)
    })
  }

  wrongUsage (msg, name) {
    let prefix = this.container.getParam('prefix')
    this.reply(msg,
      `Please run \`${prefix}help ${name}\` to use this command properly`
    )
  }

  prettyPrint (regex, matches) {
    return prettyjson.render({
      'Music Module (Discordie)': {
        regex: regex ? regex.toString() : '',
        matches: matches
      }
    }, {
      dashColor: 'magenta',
      keysColor: 'cyan'
    })
  }

  responds (content, regex, cb) {
    let matches = regex.exec(content)

    if (matches === null) {
      return false
    }

    let result = cb(matches)
    let noPrint = !this.container.get('debug')
    if (!noPrint && result !== false) {
      this.logger.debug(`\n${this.prettyPrint(regex, matches)}`)
    }
  }

  // Music

  queueYT (id, msg) {
    this.streams[msg.guild.id].queue(new YoutubeTrack(
      id, msg.author, this.logger, (err) => {
        if (err) {
          if (err.toString().indexOf('Code 150') > -1) {
            this.send(msg.channel,
              'This video is unavailable in the country I am running in. ' +
              'Please try a different video.'
            )
          } else if (err.message ===
            'Could not extract signature deciphering actions') {
            this.send(msg.channel,
              'YouTube streams have changed their formats. ' +
              'Please get the admin to update `ytdl-core`.'
            )
          } else if (err.message === 'status code 404') {
            this.send(msg.channel, 'That video does not exist.')
          } else {
            this.send(msg.channel,
              'An error occurred while getting video information. ' +
              'Please try a different video.'
            )
          }
        }
        this.streams[msg.guild.id].playlist.pop()
      }
    ))
    let check = (vid, m) => {
      if (vid.plays && vid.length) {
        m.edit(
          `:white_check_mark:  Queued ${vid.prettyPrint} - ${msg.author.mention}`
        )
        if (!this.streams[msg.guild.id].currentVideo) this.playNext(msg.guild)
        return
      } else {
        setTimeout(() => check(vid, m), 3000)
      }
    }
    msg.delete()
    this.send(msg.channel, ':mag:  Queuing song...')
    .then(msg => {
      check(_.last(this.streams[msg.guild.id].playlist), msg)
    })
  }

  queueSC (query, msg) {
    query = query.split(' ').join('_')
    let cid = this.container.getParam('soundcloud')
    this.send(msg.channel, ':mag:  Queuing song...')
    .then(msg => {
      request
      .get(`https://api.soundcloud.com/tracks/?client_id=${cid}&q=${query}`)
      .end((err, res) => {
        if (err) {
          this.logger.error('Error occurred while fetching from SC', err)
          return
        }
        if (res.statusCode === 200) {
          if (typeof res.body[0] !== 'undefined') {
            res = res.body[0]
            let vid = new SoundcloudTrack({
              addedBy: msg.author,
              url: `https://api.soundcloud.com/tracks/${res.id}` +
              `/stream?client_id=${cid}`,
              title: res.title,
              author: res.user.username,
              length: res.duration,
              plays: res.playback_count
            }, this.logger)
            this.streams[msg.guild.id].queue(vid)
            msg.edit(`:white_check_mark:  Queued ${vid.prettyPrint}`)
            if (!this.streams[msg.guild.id].currentVideo) {
              this.playNext(msg.guild)
            }
            return
          }
          msg.edit(
            `::negative_squared_cross_mark: :  Could not find any songs.`
          )
        }
      })
    })
  }

  playNext (guild) {
    this.streams[guild.id].currentVideo = null
    let stream = this.streams[guild.id]
    if (stream && stream.playlist.length > 0) {
      let vid = this.streams[guild.id].playlist.shift()
      this.send(
        this.streams[guild.id].text, `:loud_sound:  Playing ${vid.basicPrint}`
      )
      this.play(vid, guild, stream.voiceConnection)
      this.streams[guild.id].currentVideo = vid
    }
  }

  play (vid, guild, voice) {
    return new Promise((res, rej) => {
      if (vid instanceof YoutubeTrack) {
        let onMediaInfo = (err, mediaInfo) => {
          if (err) {
            this.logger.error('[Discordie] ytdl produced an error:', err)
            return
          }
          let formats = mediaInfo.formats.filter(f => f.container === 'webm')
          .sort((a, b) => b.audioBitrate - a.audioBitrate)

          let bestAudio = formats.find(f => f.audioBitrate > 0 && !f.bitrate) ||
                          formats.find(f => f.audioBitrate > 0)
          if (!bestAudio) {
            return this.logger.info(chalk.cyan('[Discordie] No valid formats'))
          }

          let encoder = voice.voiceConnection.createExternalEncoder({
            type: 'ffmpeg', source: bestAudio.url,
            debug: true
          })
          encoder.once('end', () => {
            this.send(
              this.streams[guild.id].text,
              `:speaker:  Finished playing ${vid.basicPrint}`
            )
            this.playNext(guild)
          })
          encoder.play()
        }
        try {
          ytdl.getInfo(vid.url, onMediaInfo)
        } catch (err) {
          this.logger.error('[Discordie] ytdl produced an error:', err)
          return rej(err)
        }
      } else if (vid instanceof SoundcloudTrack) {
        let encoder = voice.voiceConnection.createExternalEncoder({
          type: 'ffmpeg', source: vid.url,
          debug: true
        })
        encoder.once('end', () => {
          this.send(
            this.streams[guild.id].text,
            `:speaker:  Finished playing ${vid.basicPrint}`
          )
          this.playNext(guild)
        })
        encoder.play()
      }
      res()
    })
  }

  run () {
    let client = new Discordie()

    client.connect({
      token: this.container.getParam('token')
    })

    client.Dispatcher.on('GATEWAY_READY', e => {
      this.logger.info(`Music module connected - ` +
        `${chalk.green(client.User.username)}`)
    })

    client.Dispatcher.on('MESSAGE_CREATE', e => {
      let prefix = this.container.getParam('prefix')
      if (e.message.author.id === client.User.id) return

      this.responds(e.message.content,
        /^https:\/\/(www\.youtube\.com\/watch\?v=|youtu.be\/)(\S{11})$/i,
        matches => {
          if (Object.keys(this.streams).length > 0 &&
          this.streams[e.message.guild.id] && !e.message.isPrivate) {
            if (
              this.streams[e.message.guild.id].text.id === e.message.channel.id
            ) {
              this.queueYT(matches[2], e.message)
            }
          }
        }
      )

      if (!this.isBotMentioned(client.User, e.message, prefix)) {
        return
      }

      let m = this.prettify(e.message.content, client.User.id, prefix)
      this.responds(m, /^(summon|join)$/i, () => {
        if (e.message.isPrivate) {
          this.send(e.message.channel, 'This command cannot be run in PMs.')
          return
        }
        if (Object.keys(this.streams).length > 0) {
          for (let stream in this.streams) {
            if (this.streams.hasOwnProperty(stream)) {
              if (stream === e.message.guild.id) {
                this.reply(e.message,
                  `I\'m already in a voice channel ` +
                  `'**${this.streams[stream].voice.name}**'`
                )
                return
              }
            }
          }
        }
        let voiceChannels = e.message.guild.voiceChannels
        .filter(vc => {
          return vc.members.map(m => m.id).indexOf(e.message.author.id) > -1
        })
        if (voiceChannels.length > 0) {
          voiceChannels[0].join(false, false)
          let check = (msg) => {
            if (client.VoiceConnections.getForGuild(msg.guild)) {
              msg.edit(
                `:headphones:  Connected to '**${voiceChannels[0].name}**' ` +
                `and bound to <#${e.message.channel.id}>.`
              )
              this.streams[e.message.guild.id] = new Stream({
                text: e.message.channel,
                voice: voiceChannels[0],
                voiceConnection: client.VoiceConnections.getForGuild(msg.guild)
              })
            } else {
              setTimeout(() => check(msg), 10)
            }
          }

          this.send(e.message.channel, `:headphones:  Connecting to voice...`)
          .then((msg, err) => {
            check(msg)
          })
        }
      })

      this.responds(m, /^(leave|destroy)$/i, () => {
        if (e.message.isPrivate) {
          this.send(e.message.channel, 'This command cannot be run in PMs.')
          return
        }
        if (Object.keys(this.streams).length > 0 &&
        this.streams[e.message.guild.id]) {
          let stream = this.streams[e.message.guild.id]
          if (stream.text.id !== e.message.channel.id) {
            return
          }
          this.send(
            e.message.channel,
            `:headphones:  Disconnected from '**${stream.voice.name}**' ` +
            `and unbound from <#${stream.text.id}>`
          )
          stream.voice.leave()
          delete this.streams[e.message.guild.id]
        } else {
          this.reply(e.message, 'I\'m not in any voice channels.')
        }
      })

      this.responds(m, /^(youtube|yt)$/i, () => {
        this.wrongUsage(e.message, 'yt')
      })

      this.responds(m, /^(soundcloud|sc)$/i, () => {
        this.wrongUsage(e.message, 'sc')
      })

      this.responds(m, /^(m|music) (next|skip|>>)$/i, () => {
        if (Object.keys(this.streams).length === 0 ||
        !this.streams[e.message.guild.id]) {
          this.reply(e.message, 'Add me to a voice channel first.')
          return
        } else if (
          this.streams[e.message.guild.id].text.id !== e.message.channel.id
        ) {
          return
        }
        let stream = this.streams[e.message.guild.id]
        let vc = stream.voiceConnection
        if (!vc) {
          this.reply(e.message, 'No voice connection found.')
          return
        }
        this.playNext(e.message.guild)
      })

      this.responds(m, /^(m|music) (\|\||stop)$/i, () => {
        if (Object.keys(this.streams).length === 0 ||
        !this.streams[e.message.guild.id]) {
          this.reply(e.message, 'I\'m not in any voice channel.')
          return
        } else if (
          this.streams[e.message.guild.id].text.id !== e.message.channel.id
        ) {
          return
        }
        let stream = this.streams[e.message.guild.id].voiceConnection
        if (!stream) {
          this.reply(e.message, 'No voice connection found.')
          return
        }
        let encoderStream = stream.voiceConnection.getEncoderStream()
        encoderStream.unpipeAll()
        this.send(e.message.channel, ':pause_button:  Stopped playing music.')
      })

      this.responds(m,
        /^(youtube|yt) (add|queue|\+) (https:\/\/www\.youtube\.com\/watch\?v=(\S{11}))$/i,
        matches => {
          if (e.message.isPrivate) {
            this.send(e.message.channel, 'This command cannot be run in PMs.')
            return
          }
          if (Object.keys(this.streams).length === 0 ||
          !this.streams[e.message.guild.id]) {
            this.reply(e.message, 'Add me in a voice channel first!')
            return
          } else if (
            this.streams[e.message.guild.id].text.id !== e.message.channel.id
          ) {
            return
          }
          this.queueYT(matches[4], e.message)
        }
      )

      this.responds(m,
        /^(youtube|yt) (q|find|search|query|\?) (.+)$/i,
        matches => {
          if (e.message.isPrivate) {
            this.send(e.message.channel, 'This command cannot be run in PMs.')
            return
          }
          if (Object.keys(this.streams).length === 0 ||
          !this.streams[e.message.guild.id]) {
            this.reply(e.message, 'Add me in a voice channel first!')
            return
          } else if (
            this.streams[e.message.guild.id].text.id !== e.message.channel.id
          ) {
            return
          }
          request
          .get(
            'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' +
            escape(matches[3]) +
            `&key=${this.container.getParam('google_api')}`
          )
          .end((err, res) => {
            if (err) {
              this.reply(e.message, 'An error occurred during the YT search.')
              this.logger.error('Error found during YT search', err)
              return
            }
            let payload = res.body
            if (payload['items'].length === 0) {
              this.send(
                e.message.channel, `Query ${matches[3]} gave no answer.`
              )
              return
            }
            let videos = payload.items.filter(
              item => item.id.kind === 'youtube#video'
            )
            if (videos.length === 0) {
              this.send(
                e.message.channel, `Query ${matches[3]} gave no videos.`
              )
              return
            }

            let video = videos[0]
            this.queueYT(video.id.videoId, e.message)
          })
        }
      )

      this.responds(m, /^(soundcloud|sc) (.+)$/i, matches => {
        if (e.message.isPrivate) {
          this.send(e.message.channel, 'This command cannot be run in PMs.')
          return
        }
        if (Object.keys(this.streams).length === 0 ||
        !this.streams[e.message.guild.id]) {
          this.reply(e.message, 'Add me in a voice channel first!')
          return
        } else if (
          this.streams[e.message.guild.id].text.id !== e.message.channel.id
        ) {
          return
        }
        this.queueSC(matches[2], e.message)
      })

      this.responds(m,
        /^(playlist|pl)$/i, () => {
          if (e.message.isPrivate) {
            this.send(e.message.channel, 'This command cannot be run in PMs.')
            return
          }
          let stream = this.streams[e.message.guild.id]
          if (Object.keys(this.streams).length === 0 || !stream) {
            this.reply(e.message, 'Add me in a voice channel first!')
            return
          } else if (stream.text.id !== e.message.channel.id) {
            return
          }
          let songs = []
          if (_.keys(stream.playlist).length === 0 && !stream.currentVideo) {
            this.reply(e.message, 'I don\'t have any songs currently queued.')
            return
          } else if (stream.currentVideo) {
            this.send(e.message.channel,
              `:sound:  Currently playing: ${stream.currentVideo.fullInfo}`
            )
          }
          stream.playlist.forEach((elem, idx) => {
            songs.push(`${idx + 1}. ${elem.prettyPrint}`)
          })
          this.send(e.message.channel,
            songs.length > 0
            ? `List of queued songs in playlist:\n${songs.join('\n')}`
            : 'There are no remaining songs in the playlist. Go add some!'
          )
        }
      )
    })
  }
}

module.exports = Disco
