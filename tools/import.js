// Import libraries
var qm = require('qminer')
var fs = require('fs')

// open db
var base = new qm.Base({mode: 'open'})

// Set the filename
var filePath = './sandbox/export2.jsonld'

// Get the store
var Documents = base.store('Documents')

// Load documents (each line is a json)
var content = null

// Read the file from disk
try {
  content = fs.readFileSync(filePath, {encoding: 'utf8'})
} catch (e) {
  console.log('Error reading: ' + filePath)
}

if (!content) {
  console.log('Empty file: ' + filePath)
}

// Split the string
content = content.split('\n')
if (!content) {
  console.log('No lines in file: ' + filePath)
}

var results = []
content.forEach(function (line) {
  line = line.trim()
  if (line) {
    results.push(JSON.parse(line))
  }
})
// Print number of records read
console.log('number of records: ' + results.length)

// Modify store records with data loaded from file

results.forEach(function (entry) {
  var record = Documents.recordByName(entry.id)
  record.label = entry.label
  record.predicted = entry.label
  record.distance = 0
})

// safe exit
base.close()
