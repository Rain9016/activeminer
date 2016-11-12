// Import libraries
var qm = require('qminer')

// create db
var base = new qm.Base({ mode: 'createClean', schema: [
    {
      'name': 'Documents',
      'fields': [
        { 'name': 'id', 'type': 'string', 'primary': true },
        { 'name': 'title', 'type': 'string' },
        { 'name': 'text', 'type': 'string' },
        { 'name': 'previous_label', 'type': 'int', 'default': 0 },
        { 'name': 'label', 'type': 'int', 'default': 0 },
      ],
      'keys': [
        { 'field': 'text', 'type': 'text' }
      ]
    }
] })

// Set the filename
var filePath = './sandbox/export2.jsonld'

// Get the store
var Documents = base.store('Documents')

// Load documents (each line is a json)
qm.load.jsonFile(Documents, filePath)

// Print number of records
console.log('number of records: ' + Documents.length)

// safe exit
base.close()
