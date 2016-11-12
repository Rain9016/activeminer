var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var process = require('process')
var qm = require('qminer')
var ON_DEATH = require('death')
var SaveCheckPoint = require('./lib/savecheckpoint')

var routes = require('./routes/index')
var search = require('./routes/search')
var labeled = require('./routes/labeled')
var ranking = require('./routes/ranking')
var documents = require('./routes/document')
var data = require('./routes/data')
var settings = require('./routes/settings')

var app = express()

// open database
var base = new qm.Base({mode: 'open'})
app.set('base', base)
var Documents = base.store('Documents')
app.set('documents', Documents)

// Checkpoints
var saver = new SaveCheckPoint(Documents)
saver.loadLast()
app.set('saver', saver)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
// var favicon = require('serve-favicon')
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)
app.use('/document', documents)
app.use('/labeled', labeled)
app.use('/ranking', ranking)
app.use('/search', search)
app.use('/data', data)
app.use('/settings', settings)

ON_DEATH(function (signal, err) {
  // clean up code here
  console.log('enforcing clean exit')
  base.close()
  process.exit()
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
