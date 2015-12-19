import React from 'react'
import { Router, Route } from 'react-router'

import Promise from 'bluebird'
import Firebase from 'firebase'
import createHashHistory from 'history/lib/createHashHistory'
window.jQuery = require('jquery')

import Navbar from './Navbar.jsx'
import PostList from './PostList.jsx'
import PostCreate from './PostCreate.jsx'
import PostDetail from './PostDetail.jsx'
import Settings from './Settings.jsx'

import config from '../../../config'
import UserService from '../../UserService'

var App = React.createClass({
  getInitialState () {
    return {alerts: []}
  },
  componentWillMount () {
    var self = this
    self.history = createHashHistory()
    self.fbRef = config.fbRef
    self.u = UserService.instance
    self.u.on('user', user => { self.forceUpdate() })
    self.u.on('error', err => { self.alertFromError(err) })
    self.u.updateUser()
      // .then(user => user || self.u.getUserAnonymously())
      .catch(self.alertFromError)
      .done()
  },
  getChildContext () {
    return {
      app: this,
      fbRef: this.fbRef,
      history: this.history,
      u: this.u
    }
  },

  alertFromError (err) {
    console.error(err)
    var alerts = this.state.alerts
    var alert = {
      className: err.className || 'alert-warning',
      children: err.contents || (
        <span>{err.message}</span>
      ),
      err: err
    }
    alerts.push(alert)
    this.setState({alerts})
    return alert
  },
  closeAlert (alertIndex, evt) {
    var alerts = this.state.alerts
    var closedAlert = alerts.splice(alertIndex, 1)[0]
    this.setState({alerts})
  },

  createElement (Component, props) {
    props.app = this
    return <Component {...props} />
  },
  render () {
    return (
      <div>
        <Navbar app={this} />
        <main className="container">
          <div>
            {this.state.alerts.map((alert, alertIndex) => (
              <div className={`alert ${alert.className || 'alert-danger'}`} role="alert" key={alertIndex}>
                <button
                  className="close"
                  aria-label="Close"
                  onClick={this.closeAlert.bind(this, alertIndex)}>
                  <span aria-hidden="true">&times;</span>
                </button>
                {alert.children}
              </div>
            ))}
          </div>
          <Router history={this.history} createElement={this.createElement}>
            <Route path="/" component={PostList} />
            <Route path="/settings" component={Settings} />
            <Route path="/posts/create" component={PostCreate} />
            <Route path="/posts/:postKey" component={PostDetail} />
            <Route path="/users/:userKey" component={null} />
          </Router>
        </main>
      </div>
    )
  }
})
App.childContextTypes = {
  app: React.PropTypes.instanceOf(App),
  fbRef: React.PropTypes.instanceOf(Firebase),
  history: React.PropTypes.object,
  u: React.PropTypes.instanceOf(UserService)
}

export default App