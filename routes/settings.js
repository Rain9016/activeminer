var express = require('express')
var router = express.Router()

router.post('/', function (req, res) {
  var autorank = parseInt(req.body.autorank)
  if (!isNaN(autorank)) {
    autorank = Boolean(autorank)
    req.app.set('autorank', autorank)
  }

  res.status(200).json(null)
})

module.exports = router
