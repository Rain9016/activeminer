var express = require('express')
var router = express.Router()

/* GET users listing. */
router.get('/', function (req, res, next) {
  var results = []
  var total = 0
  var pages = 0
  var per_page = 20
  var start = 1
  var end = 1

  // ## URL Parameters
  // page
  var p = parseInt(req.query.page)
  if (isNaN(p)) { p = 1 }
  if (p <= 0) { p = 1 }

  // filter
  var classFilter = parseInt(req.query.filter)
  if (isNaN(classFilter)) { classFilter = 0 }

  // order
  var certainFirst = parseInt(req.query.reverse)
  if (isNaN(certainFirst)) { certainFirst = 0 }
  certainFirst = Boolean(certainFirst)

  // query
  var q = req.query.q || null

  // ## Get documents (Unlabeled)
  results = req.app.get('documents').allRecords
  results = results.filter(function (r) {
    return r.label === 0
  })
  // sort by id
  results.sort(function (rec1, rec2) {
    return rec1.id < rec2.id
  })

  // ## Query
  if (q !== null) {
    var base = req.app.get('base')
    var q_results = base.search({$from: 'Documents', text: q})

    // extract id array
    q_results = q_results.getVector('id').toArray()

    // filter ranking results to include only those in query
    results = results.filter(function (r) {
      return q_results.indexOf(r.id) >= 0
    })
  }

  if (results !== null) {
    results = results.toJSON().records
    // ## Pagination
    total = results.length
    pages = Math.ceil(total / per_page)
    if (p > pages) { p = pages }
    start = per_page * (p - 1)
    end = start + per_page
    results = results.slice(start, end)

    // ## Text formatting
    for (var ii = 0; ii < results.length; ii++) {
      var text = results[ii].text
      if (text && !Array.isArray(text)) {
        text = text.trim()
        results[ii].text = text.split(/[\n]/g)
      }
    }
  } else {
    results = []
  }

  var vars = {
    title: 'ActiveMiner',
    subtitle: 'ranking',
    data: results,
    total: total,
    page: p,
    pages: pages,
    start: start,
    end: end,
    filter: classFilter,
    reverse: certainFirst,
    autorank: req.app.get('autorank')
  }
  res.render('ranking', vars)
})

router.post('/', function (req, res) {
  res.status(200).json({status: 200})
})

module.exports = router
