var fs = require('fs')

function SaveCheckPoint (Documents) {
  this.lastCheckpoint = null
  this.Documents = Documents
  this.interval = 20
  this.checkPointPath = './sandbox/saves/checkpoint.jsonld'
}

// check how many are relevant
SaveCheckPoint.prototype.countLabeled = function (results) {
  var relevant = []

  relevant = results.filter(function (entry) {
    return entry.label !== 0
  })

  return relevant.length
}

// load file
SaveCheckPoint.prototype.loadFile = function (filePath) {
  var content = null

  // Read the file from disk
  try {
    content = fs.readFileSync(filePath, {encoding: 'utf8'})
  } catch (e) {
    return null
  }

  if (!content) {
    return null
  }

  // Split the string
  content = content.split('\n')
  if (!content) {
    return null
  }

  var results = []
  content.forEach(function (line) {
    line = line.trim()
    if (line) {
      results.push(JSON.parse(line))
    }
  })

  return results
}

// Sets lastCheckpoint to the number of examples in the last checkpoint or to 0
SaveCheckPoint.prototype.loadLast = function () {
  // load
  var results = this.loadFile(this.checkPointPath)

  if (!results) {
    this.lastCheckpoint = 0
    return null
  }

  // count relevant
  var relevant = this.countLabeled(results)

  // Set lastCheckpoint
  this.lastCheckpoint = relevant

  return results
}

// Gets the labeled data from the database
SaveCheckPoint.prototype.getData = function () {
  var results = this.Documents.allRecords

  // only labeled
  results = results.filter(function (r) {
    return r.label > 0 || r.label < 0
  })

  // convert to JSON
  results = results.toJSON().records || []

  return results
}

SaveCheckPoint.prototype.getFilePath = function (fileName) {
  // get the timestamp
  var timestamp = Math.floor(new Date() / 1000).toString()

  // create the path + filename
  var filePath = null
  if (fileName) {
    filePath = './sandbox/saves/' + fileName + '.jsonld'
  } else {
    filePath = './sandbox/saves/' + timestamp + '.jsonld'
  }

  return filePath
}

SaveCheckPoint.prototype.saveFile = function (results, filePath) {
  var contents = ''

  results.forEach(function (r) {
    delete r.predicted
    delete r.distance
    contents += JSON.stringify(r) + '\n'
  })

  // write to file
  fs.writeFileSync(filePath, contents)
}

SaveCheckPoint.prototype.exportData = function () {
  var results = this.getData()

  var filePath = this.getFilePath()

  this.saveFile(results, filePath)

  return filePath
}

SaveCheckPoint.prototype.checkpoint = function () {
  // Check when was last checkpoint
  if (!this.lastCheckpoint) {
    console.log('Load Last CheckPoint')
    this.loadLast()
  }

  console.log('Last: ' + this.lastCheckpoint)

  // get the data
  var results = this.getData()
  var numberOfRelevantResults = this.countLabeled(results)
  console.log('Now: ' + numberOfRelevantResults)

  // Do we need to create a new checkpoint?
  if (this.lastCheckpoint + this.interval >= numberOfRelevantResults) {
    console.log('No need to checkpoint')
    return false
  }

  // save a backup
  var filePath = this.getFilePath()
  this.saveFile(results, filePath)

  // create new checkpoint
  this.saveFile(results, this.checkPointPath)

  this.lastCheckpoint = numberOfRelevantResults
  console.log('Saved: ' + this.lastCheckpoint)

  return filePath
}

module.exports = SaveCheckPoint
