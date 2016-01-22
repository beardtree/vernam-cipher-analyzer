#!/usr/bin/env node

'use strict'

const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const errorHandler = require('errorhandler')
const Promise = require('bluebird')
const _ = require('lodash')
const opn = require('opn')

const execAsync = Promise.promisify(require('child_process').exec)
const parseColumns = require('parse-columns')

const numericPsCols = require('../numericPsCols')
const arrayToObjectKeys = require('../arrayToObjectKeys')

class WebtopServer {
  constructor (opts) {
    this.opts = opts
    this.initApp()
  }

  initApp () {
    var app = this.app = express()

    app.get('/api/ps', (req, res) => {
      this.ps().then(ps => { res.json(ps) }).done()
    })
    app.post('/api/kill/:ps', (req, res) => {
      req.params.ps
        .split(/\s*,\s*/)
        .forEach(pid => { process.kill(pid, req.query.signal) })
      res.json(true)
    })
    app.use(express.static(path.resolve(__dirname, '..', '..', 'dist')))

    app.use(methodOverride())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
      extended: true
    }))
    app.use(errorHandler({
      dumpExceptions: true,
      showStack: true
    }))
  }

  listen () {
    var listener
    return new Promise(resolve => (
      listener = this.app.listen(this.opts.port, this.opts.hostname, resolve)
    )).then(() => listener)
  }

  main () {
    this.listen()
      .then(listener => listener.address())
      .then(bound => `http://${bound.address}:${bound.port}`)
      .tap(address => {
        console.error(`WebtopServer started: ${address}`)
        if (this.opts.open) {
          console.error("(opts.open = true, opening)")
          opn(address)
        }
      })
      .done()
  }

  static get psCmd () { return 'ps -Eeo pid,ppid,pcpu,pmem,user,args' }

  ps () {
    return execAsync(this.constructor.psCmd, {maxBuffer: this.opts.maxBuffer})
      .then(stdout => parseColumns(stdout, {transform: (el, header) => {
        if (numericPsCols[header]) el = Number(el)
        return el
      }}))
  }
}

module.exports = WebtopServer

if (require.main === module) new WebtopServer(require('../../config')).main()