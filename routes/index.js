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

  // URL params
  var q = req.query.q || null
  var p = parseInt(req.query.page)
  if (isNaN(p)) { p = 1 }
  if (p <= 0) { p = 1 }

  // execute query and set stuff
  if (q !== null) {
    var base = req.app.get('base')
    results = base.search({$from: 'Documents', text: q})

    // only unlabeled
    results.filter(function (r) {
      return r.label === 0
    })

    results = results.toJSON().records || []
  }

  // pagination
  total = results.length
  pages = Math.ceil(total / per_page)
  if (p > pages) { p = pages }
  start = per_page * (p - 1)
  end = start + per_page
  results = results.slice(start, end)

  // replace titles
  for (var ii = 0; ii < results.length; ii++) {
    var text = results[ii].text.trim()
    results[ii].text = text.split(/[\n]/g)
  }

  var vars = {
    title: 'ActiveMiner',
    subtitle: 'search',
    data: results,
    total: total,
    page: p,
    query: q,
    pages: pages,
    start: start,
    end: end,
    autorank: req.app.get('autorank')
  }
  res.render('index', vars)
})

module.exports = router
