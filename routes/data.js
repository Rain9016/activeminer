var express = require('express')
var router = express.Router()

router.get('/', function (req, res, next) {
  var download = parseInt(req.query.download)
  if (isNaN(download)) { download = 0 }

  if (download) {
    var saver = req.app.get('saver')
    var filePath = saver.checkPointPath
    var fileName = filePath.split('/')
    fileName = fileName[fileName.length - 1]
    console.log(filePath)
    res.download(filePath, fileName, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log('yes')
      } })
  } else {
    var vars = {
      title: 'ActiveMiner',
      subtitle: 'export',
      autorank: req.app.get('autorank')
    }
    res.render('export', vars)
  }
})

module.exports = router
