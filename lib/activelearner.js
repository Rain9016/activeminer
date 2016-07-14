var qm = require('qminer')
var analytics = qm.analytics
var la = qm.la
var fs = qm.fs

function ActiveLearner (recSet, settings) {
  // Records
  this.recSet = recSet.clone()
  this.base = this.recSet.store.base
  this.Documents = this.recSet.store

  // SVM and AL
  this.settings = settings
  this.minExamplesPerClass = 2
  this.maxTest = 2000 // maximum number of records in a test set

  // Timing
  this.start = null

  this.clear()
}

ActiveLearner.prototype.clear = function () {
  this.svc = null // the SVM Model
  this.testSet = null // the unlabelled records (test set)
  this.distances = null // distances to the decision boundary
  this.ranking = null // records ranked by uncertainty
}

// Start or Reset Timer
ActiveLearner.prototype.startTimer = function () {
  this.start = process.hrtime()
}

//
ActiveLearner.prototype.elapsedTime = function () {
  if (this.start === null) {
    this.startTimer()
    return null
  }

  // elapsed time
  var diff = process.hrtime(this.start)
  var elapsed = diff[0] * 1e9 + diff[1] // nanoseconds
  elapsed = Math.ceil(elapsed / 1e6) // milli seconds

  // reset the timer
  this.start = process.hrtime()

  return elapsed
}

// Train SVM classifier
ActiveLearner.prototype.reRank = function () {
  var ii = 0 // for cycles
  var elapsed = 0 // elapsed times

  this.clear()
  this.startTimer()

  // We start by building an example (train) matrix and the associated
  // label vector from the manually labelled examples

  // Records labelled positive
  var pRecs = this.recSet.clone()
  pRecs.filter(function (rec) { return rec.label === 1 })
  // ensure minumum number of positive examples
  if (pRecs.length < this.minExamplesPerClass) {
    this.clear()
    return false
  }

  // Records labelled negative
  var nRecs = this.recSet.clone()
  nRecs.filter(function (rec) { return rec.label === -1 })
  // ensure minumum number of negative examples
  if (nRecs.length < this.minExamplesPerClass) {
    this.clear()
    return false
  }

  // combine the positve and negative records into a single record set
  // creating our training set
  var trainSet = pRecs.setUnion(nRecs)

  elapsed = this.elapsedTime()
  console.log('Train Set Created in: ' + elapsed + ' ms')

  // Create the feature space
  // define features
  var ftrSrcs = [{
    type: 'text',
    source: 'Documents',
    field: 'text',
    ngrams: [1, 3],
    weight: 'tfidf',
    tokenizer: {
      type: 'simple',
      stopwords: 'en'
    },
    normalize: true
  }]
  var ftrSpace = new qm.FeatureSpace(this.base, ftrSrcs)

  // build feature space
  ftrSpace.updateRecords(trainSet)

  elapsed = this.elapsedTime()
  console.log('Feature Extractor built in: ' + elapsed + ' ms')

  // extract the feature matrix
  var trainMatrix = ftrSpace.extractMatrix(trainSet)

  // and create the label vector
  var trainLabels = new la.Vector(trainSet.getVector('label').toArray())

  console.log('trainLabels: ' + trainLabels.length)
  elapsed = this.elapsedTime()
  console.log('Train Matrix and Label Vectors created in: ' + elapsed +
    ' ms')

  // Create and train a SVM classifier
  this.svc = new analytics.SVC(this.settings)
  this.svc.fit(trainMatrix, trainLabels)

  elapsed = this.elapsedTime()
  console.log('Classifier fitted in: ' + elapsed + ' ms')

  // Create Test Set and Extract Features

  // now, we can assign a label/score to all unlabelled records
  // i.e. our test set
  this.testSet = this.recSet.clone()
  this.testSet.filter(function (rec) { return rec.label === 0 })
  if (this.maxTest > 0) {
    this.testSet.shuffle()
    this.testSet.trunc(this.maxTest, 0)
  }

  elapsed = this.elapsedTime()
  console.log('Test Set created in: ' + elapsed + ' ms')

  // again we need a feature matrix, this time for the test set
  var testMatrix = ftrSpace.extractSparseMatrix(this.testSet)

  elapsed = this.elapsedTime()
  console.log('Test Matrix created in: ' + elapsed + ' ms')

  // now we can calculate the decision function,
  // the sign of it gives us the class while the absolute value gives us a
  // measure of the confidence in our classification
  this.distances = this.svc.decisionFunction(testMatrix)
  elapsed = this.elapsedTime()
  console.log('Tested in: ' + elapsed + ' ms')

  // now we create the class vector and the "certainty" vector
  for (ii = 0; ii < this.distances.length; ii++) {
    if (this.distances[ii] > 0) {
      this.testSet[ii].predicted = 1
      this.testSet[ii].distance = this.distances[ii]
    } else {
      this.testSet[ii].predicted = -1
      this.testSet[ii].distance = Math.abs(this.distances[ii])
    }
  }

  elapsed = this.elapsedTime()
  console.log('Class/Certainty Vectors generated in: ' + elapsed + ' ms')

  elapsed = this.elapsedTime()

  // ascending sort for uncertainty (index 0 = most uncertain)
  this.testSet.sortByField('distance', true)
  console.log('Sorted Certainty Vector in: ' + elapsed + ' ms')

  // convert to JSON
  this.ranking = this.testSet.toJSON().records
  elapsed = this.elapsedTime()
  console.log('Rank variable created in: ' + elapsed + ' ms')

  return true
}

// returns the full ranking
ActiveLearner.prototype.getRanking = function (certainFirst, classFilter) {
  var ranking = null // the result

  if (!this.ranking) { return null }

  // Update: Remove Labeled (e.g. not relevant)
  var Documents = this.Documents
  this.ranking = this.ranking.filter(function (r) {
    var did = r.id
    var rec = Documents.recordByName(did)
    if (rec.label !== 0) {
      return false
    }
    return true
  })

  // by default, we want all classes but in certain cases we might want
  // just one class
  if (classFilter === -1 || classFilter === 1) {
    ranking = this.ranking.filter(function (rec) {
      if (rec.predicted === classFilter) {
        return true
      }
    })
  } else {
    ranking = this.ranking.slice(0) // simply copy the ranking
  }

  // by default, we want the most uncertain examples first
  certainFirst = certainFirst || false
  if (certainFirst) {
    ranking.reverse()
  }

  return ranking
}

ActiveLearner.prototype.saveModel = function (savePath) {
  if (!this.svc) { return false }
  var fout = fs.openWrite(savePath)
  this.svc.save(fout)
  fout.close()
}

module.exports = ActiveLearner
