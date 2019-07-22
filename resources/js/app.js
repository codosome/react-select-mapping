/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

require('./bootstrap');

import React from 'react';
import { render } from 'react-dom'
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import routes from './routes'

import configureStore from './store/configureStore'
import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import './asset/app.scss'

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    defaultIsVisible={false}>
    <LogMonitor theme="tomorrow" preserveScrollTop={false} />
  </DockMonitor>
)
let store = configureStore(window.__INITIAL_STATE__, browserHistory, DevTools)

let history = syncHistoryWithStore(browserHistory, store)

const handUpdatePath = () =>{
  let routingState = store.getState().routing;
  let routeAction = routingState.locationBeforeTransitions.action;
  if(routeAction == "PUSH"){
    window.scrollTo(0, 0);
  }
}

const renderDOM = Component => {
  if(process.env.NODE_ENV === 'production'){
    render(
      <Provider store={store}>
        <div>
          <Router history={history} children={routes} onUpdate={handUpdatePath}/>
        </div>
      </Provider>,
      document.getElementById('app')
    );
  }
  else{
    render(
      <Provider store={store}>
        <div>
          <Router history={history} children={routes} onUpdate={handUpdatePath}/>
          <DevTools />
        </div>
      </Provider>,
      document.getElementById('app')
    );
  }
}

renderDOM()
