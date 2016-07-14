var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  var results = []
  var total = 0
  var pages = 0
  var per_page = 20
  var start = 1
  var end = 1
  var ii

  // ## URL params
  // - query
  var q = req.query.q || null
  var p = parseInt(req.query.page)
  if (isNaN(p)) { p = 1 }
  if (p <= 0) { p = 1 }

  // - filter
  var classFilter = parseInt(req.query.filter)
  if (isNaN(classFilter)) { classFilter = 0 }

  // apply the query
  if (q !== null) { // query
    var base = req.app.get('base')
    results = base.search({$from: 'Documents', text: q})
  } else {
    var Documents = req.app.get('documents')
    results = Documents.allRecords
  }

  // ## Apply filters
  // - no unlabeled
  results.filter(function (r) {
    return r.label !== 0
  })

  // - one class
  if (classFilter) {
    console.log('Filtering by class: ' + classFilter)
    results.filter(function (r) {
      return r.label === classFilter
    })
  }

  // convert to JSON
  results = results.toJSON().records
  for (ii = 0; ii < results.length; ii++) {
    results[ii].predicted = results[ii].label
  }

  // ## Pagination
  total = results.length
  pages = Math.ceil(total / per_page)
  if (p > pages) { p = pages }
  start = per_page * (p - 1)
  end = start + per_page
  results = results.slice(start, end)

  // ## Formating
  for (ii = 0; ii < results.length; ii++) {
    var text = results[ii].text.trim()
    results[ii].text = text.split(/[\n]/g)
  }

  var vars = {
    title: 'ActiveMiner',
    subtitle: 'labeled',
    data: results,
    total: total,
    page: p,
    query: q,
    pages: pages,
    start: start,
    end: end,
    filter: classFilter,
    autorank: req.app.get('autorank')
  }
  res.render('labeled', vars)
})
module.exports = router
