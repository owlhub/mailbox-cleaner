require('dotenv').config()

const ImapClient = require('emailjs-imap-client').default
const { asyncForEach } = require('./lib/utils')
const { filters } = require('./filters/gmail.json');

(async function () {
  try {
    let confOption = {
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      logLevel: 'error'
    }

    if (process.env.PORT == 993) {
      confOption.useSecureTransport = true
    }

    const imap = new ImapClient(process.env.HOST, process.env.PORT, confOption)

    // Connect to Email Service Provider using IMAP
    await imap.connect()

    await asyncForEach(filters, async (filter) => {
      const uidsToDelete = []

      const result = await imap.search('[Gmail]/All Mail', filter, { byUid: true })

      result.forEach((uid) => uidsToDelete.push(uid))

      if (uidsToDelete.length) {
        console.log(filter)
        console.log(uidsToDelete)
        await imap.deleteMessages('[Gmail]/All Mail', uidsToDelete, { byUid: true })

        await imap.moveMessages('[Gmail]/All Mail', uidsToDelete, '[Gmail]/Trash', { byUid: true })
      }
    })

    await imap.logout()
    await imap.close()
  } catch (err) {
    console.log(err)
  }
})()
