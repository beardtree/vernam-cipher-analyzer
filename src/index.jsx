import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import jQuery from 'jquery'; window.jQuery = jQuery
require('bootstrap/dist/js/bootstrap')

import VernamTools from './components/VernamTools.jsx'

jQuery($ => {
  $('body')
    .tooltip({
      selector: '[data-toggle="tooltip"]',
      container: 'body',
      title: function () {
        var $el = $(this)
        return $el.attr('title') || $el.text()
      }
    })
    .on('show.bs.tooltip', '*', evt => $('.tooltip').remove()) // FIXME: hack to ensure only one tooltip is shown at a time

  ReactDOM.render((
    <VernamTools />
  ), $('#vernamtools')[0])
})
