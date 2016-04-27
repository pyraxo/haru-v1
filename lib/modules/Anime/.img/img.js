import request from 'superagent'

module.exports = function imageSearch (board, query, cmd, val) {
  query = query || ''
  val = val ? `&${val}` : ''
  let boards = {
    'danbooru': 'http://danbooru.donmai.us/posts.json?limit=1' +
    '&page=1&tags=order:random+',
    'gelbooru': 'http://gelbooru.com/index.php?page=dapi' +
    '&s=post&q=index&limit=1&json=1&tags=',
    'yandere': 'https://yande.re/post/index.json?limit=1' +
    '&page=1&tags=order:random+',
    'konachan': 'http://konachan.com/post/index.json?tags=order:random+'
  }
  if (!boards[board]) {
    cmd.reply(`Image board ${board} is not supported.`)
  }
  return new Promise((resolve, reject) => {
    request
    .get(`${boards[board]}${query}${val}`)
    .end((err, res) => {
      if (err) {
        cmd.logger.error(`Error searching ${board} with query ${query}:`, err)
        reject(err)
      }
      resolve(res)
    })
  })
}
