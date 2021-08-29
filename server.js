require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const MongoClient = require('mongodb').MongoClient
const nodemailer = require('nodemailer')
const { JSDOM } = require('jsdom')
const { window } = new JSDOM('')
const $ = require('jquery')(window)
const history = require('connect-history-api-fallback')
const serveStatic = require('serve-static')

console.log(111111111111)

app.use(history())
app.use(serveStatic(__dirname+'/public/dist/spa'))
app.use(express.json())
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')
  // res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

const server = app.listen(port, (err) => {
  if (!err) {
    console.log(`Server on !`)
  }
})

const io = require('socket.io').listen(server)
io.on('connection', function (socket) {
  socket.on('test', function (frontendData) {
    io.emit('test', {
      test: frontendData.test
    })
  })
  socket.on('submitForm', function (submitResults) {
    Object.keys(submitResults).forEach(submitResult => {
      process.stdout.write(`${submitResult}: ${submitResults[submitResult]} `)
    })

    MongoClient.connect('mongodb://127.0.0.1:12345', function (err, client) {
      if (!err) {
        client.db('官網').collection('formResults').insertOne(submitResults)
        client.db('官網').collection('formResults').find({ Email: submitResults.Email }).toArray(function (err0, document) {
          if (!err0) {
            var htmlForClient = `<div><h2>${document[document.length - 1].公司名稱} ${document[document.length - 1].姓名}${document[document.length - 1].職稱}您好，</h2><h2>感謝您使用瑋安的服務，我們將儘快安排專人與您聯繫。</h2><h2>此乃系統自動發信，請勿回覆。</h2><br/><h2>敬祝 順心</h2><h1 style='font-size: xx-large;'>瑋安企業有限公司</h1><img src='https://img.onl/PctNCS' alt='瑋安企業有限公司' width='20%' height='20%'/><p>02-82927060</p><p>新北市五股區五工路 138 號</p><p>korise.k3767@msa.hinet.net</p></div>`
            var htmlForKorise = `<div><h2>收到網頁表單送出資料，以下為資料詳情：</h2><br/><h1>姓名： ${document[document.length - 1].姓名}</h1><h1>公司名稱： ${document[document.length - 1].公司名稱}</h1><h1>產業類別： ${document[document.length - 1].產業類別}</h1><h1>Email： ${document[document.length - 1].Email}</h1><h1>連絡電話： ${document[document.length - 1].連絡電話} 分機： ${document[document.length - 1].分機}</h1><h1>備註： ${document[document.length - 1].備註}</h1><h1>所在地區： ${document[document.length - 1].所在地區}</h1><h1>海外地區： ${document[document.length - 1].海外地區}</h1></div>`
            sendEmail(document[document.length - 1].Email, htmlForClient)
            sendEmail('korise.k3767@msa.hinet.net', htmlForKorise)
            var data = [Object.values(document[document.length - 1])]
            var parameter = {
              url: 'https://docs.google.com/spreadsheets/d/1vuFfZUY2js_KrGzIK516GsEzvCCt4xgPKAbu9QDhfSE/edit#gid=0',
              name: '工作表1',
              data: data.toString(),
              row: data.length,
              column: data[0].length,
              insertType: 'bottom'
            }
            $.get('https://script.google.com/macros/s/AKfycbxIMQeCFw4uxL30DvNvPr-__TactJed7QAqqdf6ow/exec', parameter, function (response) {
              if (response === '成功') {
                console.log('成功')
              } else {
                console.log('失敗')
              }
            })
          }
          client.close()
        })
      }
    })
  })
})
  
function sendEmail (receiverEmailAddress, html) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
    }
  })

  var mailOptions = {
    from: 'korise.k3767@gmail.com',
    to: receiverEmailAddress,
    subject: 'Email from Korise',
    html: html
  }

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
    console.log('Error Occurs', err)
    } else {
    console.log('Email sent!!!')
    }
  })
}
