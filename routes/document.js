var express = require('express')
var router = express.Router()

/* GET users listing. */
router.get('/:id', function (req, res, next) {
  var Documents = req.app.get('documents')
  var did = req.params.id
  var record = Documents.recordByName(did).toJSON()
  var text = record.text.trim()
  record.text = text.split(/[\n]/g)

  var vars = {
    title: 'ActiveMiner',
    doc: record,
    autorank: req.app.get('autorank')
  }
  res.render('document', vars)
})

router.post('/:id', function (req, res) {
  var Documents = req.app.get('documents')
  var did = req.params.id
  var record = Documents.recordByName(did)
  record.label = parseInt(req.body.label)
  record.predicted = parseInt(req.body.label)
  record.distance = 0
  var autorank = req.app.get('autorank')
  var saver = req.app.get('saver')

  // checkpoint
  console.log('Saving')
  saver.checkpoint()

  // re-rank
  var learner = req.app.get('learner')
  if (autorank && record.label !== -2) {
    console.log('Ranking')
    learner.reRank()
  }

  res.status(200).json({reload: autorank})
})

module.exports = router
