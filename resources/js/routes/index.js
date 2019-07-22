import React from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import Application from '../container/Application'
import HomeComponent from '../container/Home'

export default (
  <Router history={browserHistory}>
    <Route path="/" component={Application}>
      <IndexRoute component={HomeComponent}/>
    </Route>
  </Router>
)
