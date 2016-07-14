// Import libraries
var qm = require('qminer')

// create db
var base = new qm.Base({ mode: 'createClean', schemaPath: 'documents.def' })

// Set the filename
var filePath = './sandbox/documents.jsonld'

// Get the store
var Documents = base.store('Documents')

// Load documents (each line is a json)
qm.load.jsonFile(Documents, filePath)

// Print number of records
console.log('number of records: ' + Documents.length)

// safe exit
base.close()
