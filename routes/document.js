var express = require('express')
var router = express.Router()

/* GET */
router.get('/:id', function (req, res, next) {
  var Documents = req.app.get('documents')
  var did = req.params.id
  var record = Documents.recordByName(did).toJSON()
  var text = record.text.trim()
  record.text = text.split(/[\n]/g)

  var vars = {
    title: 'ActiveMiner',
    doc: record
  }
  res.render('document', vars)
})

router.post('/:id', function (req, res) {
  var Documents = req.app.get('documents')
  var did = req.params.id

  // record label
  var label = parseInt(req.body.label)
  console.log('Set label: ' + label)
  var record = Documents.recordByName(did)
  record.label = label
  record.predicted = label
  record.distance = 0

  var saver = req.app.get('saver')

  // checkpoint
  console.log('Saving')
  saver.checkpoint()

  res.status(201).json({status: 200})
})

module.exports = router
