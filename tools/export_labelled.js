var fs = require('fs')
var qm = require('qminer')

var records_to_string = function (records) {
  var contents = ''

  results.forEach(function (r) {
    delete r.predicted
    delete r.distance
    contents += JSON.stringify(r) + '\n'
  })

  return contents
}

// Creates two datasets:
// 1 - Relevant vs Not Relevant
// 2 - Negative vs Possitive

var base = new qm.Base({mode: 'open', readOnly: true})
var Documents = base.store('Documents')
var results = Documents.allRecords.toJSON().records

// only labeled
var labeled = results.filter(function (r) {
  return r.label !== 0
})

// only relevant
var relevant = labeled.filter(function (r) {
  return r.label === 1 || r.label === -1
})

var contents

// 1 - Export All Labelled
contents = records_to_string(labeled)
// write to file
fs.writeFileSync('labeled.jsonld', contents)

// 2 - Negative vs Possitive
contents = records_to_string(relevant)
// write to file
fs.writeFileSync('negpos.jsonld', contents)

// Close
base.close()
