require('dotenv').config()
const { TOKEN, DISCORD_CHANNEL, YOUTUBE_CHANNEL, YOUTUBE_API_KEY, NOTIFICATION_MESSAGE, NO_LIVE_MESSAGE } = process.env

const fetch = require('node-fetch')
const { Client, RichEmbed } = require('discord.js')
const client = new Client()
let channel
let liveEmbed
let lastLiveID

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  channel = client.channels.get(DISCORD_CHANNEL)
  sendNotification()
  setInterval(sendNotification, 10 * 1000)
})

client.on('message', async msg => {
  if (msg.content === 'yt!live') msg.reply(await checkLive() ? liveEmbed : NO_LIVE_MESSAGE)
})

async function checkLive () {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`)
  const json = await res.json()
  if (!json.items.length) return false
  const { items: [ { id: { videoId }, snippet: { title, description, thumbnails } } ] } = json
  liveEmbed = new RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setImage(thumbnails.high.url)
    .setURL(`https://youtube.com/watch?v=${videoId}`)
    .setColor(0xFF0000)
  return true
}

async function sendNotification () {
  console.log('Checking...')
  if (!await checkLive()) return console.log('No live!')
  if (liveEmbed.url.endsWith(lastLiveID)) return console.log('Live already reported!')
  lastLiveID = liveEmbed.url
  channel.send(NOTIFICATION_MESSAGE, liveEmbed)
  console.log('Live reported!')
}
client.login(TOKEN)
