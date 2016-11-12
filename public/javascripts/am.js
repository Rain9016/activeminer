// search button javascript
function search () {
  var query = $('#search-field').val() || null

  var uri = new URI(window.location.href)
  uri.search(function (data) { data.q = query })
  uri.search(function (data) { data.page = 1 })

  window.location.href = uri.toString()
}
$('#search-button').on('click', function () {
  search()
})

// Save Button
$('#save-button').on('click', function () {
  var url = '/data/'
  var $btn = $(this).button('loading')

  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: url,
    data: {},
    timeout: 10000,
    success: function () {
      $btn.button('reset')
    },
    error: function (x, t, m) {
      $btn.button('reset')
    }
  })
})
// Download Button
$('#download-button').on('click', function () {
  var uri = new URI(window.location.href)
  uri.search(function (data) { data.download = 1 })
  window.location.href = uri.toString()
})

// ReRank Button
$('#rerank').on('click', function () {
  var url = '/ranking/'
  $(this).button('loading')

  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: url,
    data: {},
    timeout: 10000,
    success: function () {
      window.location.reload()
    },
    error: function (x, t, m) {}
  })
})

$('#search-field').keypress(function (e) {
  if (e.which === 13) {
    search()
    return false
  }
})

// Radio Buttons for labelling data
$('.btn-group.class-labels :input').change(function () {
  var did = $(this).attr('data-id')
  var label = $(this).attr('data-label')

  var url = '/document/' + did
  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: url,
    data: {label: label},
    timeout: 40000,
    success: function (data) {
      window.location.reload()
    },
    error: function (x, t, m) {
      console.log('FAIL')
      console.log(m)
    }
  })
})

// Radio Buttons for Filtering Ranked Tables
$('.btn-group.class-selector :input').change(function () {
  var label = $(this).attr('data-label')

  var uri = new URI(window.location.href)
  uri.search(function (data) {
    data.filter = label
    data.page = 1
  })

  window.location.href = uri.toString()
})
// Radio Buttons for Filtering Ranked Tables
$('.btn-group.sort-selector :input').change(function () {
  var reverse = $(this).attr('data-label')

  var uri = new URI(window.location.href)
  uri.search(function (data) {
    data.reverse = reverse
    data.page = 1
  })

  window.location.href = uri.toString()
})

// Radio Buttons for AutoRanking
$('#autoranking :input').change(function () {
  var autorank = $(this).attr('data-label')

  var url = '/settings/'
  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: url,
    data: {autorank: autorank},
    timeout: 10000,
    success: function () {},
    error: function (x, t, m) {}
  })
})
