import 'whatwg-fetch'
import React from 'react'
const SERVER_URL = process.env.SERVER_URL

export function createReducer(initialState, reducerMap) {
  return (state = initialState, action) => {
    const reducer = reducerMap[action.type]
    return reducer ? reducer(state, action.payload) : state
  }
}

export function download(url, path) {
  const {
    hostname, protocol
  } = window.location
  let a = document.createElement('a')
  document.body.appendChild(a)
  a.style = 'display:none'
  a.href = `${protocol}//${hostname}:8081${url}`
  a.download = require('path').basename(path)
  a.click()
}

export function call(url, method, data) {
  const {
    hostname, protocol
  } = window.location
  const serverUrl = `${SERVER_URL}${url}`
  return fetch(serverUrl, {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(parseJSON)
    .then(checkHttpStatus)
    .catch(error => {
      // No response from the server
      if (typeof error.response === 'undefined') {
        error.response = {
          status: 408,
          message: 'Cannot connect to the server'
        }
      }
      throw error
    })
}

export function get(url) {
  return call(url, 'get')
}

export function post(url, data) {
  return call(url, 'post', data)
}

export function put(url, data) {
  return call(url, 'put', data)
}

export function del(url, data) {
  return call(url, 'delete', data)
}

export function checkHttpStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    createCookie()
    return response.body
  }
     else {
    var error = new Error(response.statusText)
    error.response = response.body
    throw error
  }
}

export function parseJSON(response) {
  return response.json()
    .then(function (body) {
      return {
        status: response.status,
        statusText: response.statusText,
        body: body
      }
    })
    .catch(function(e) {
      return response;
    })
}

export const storage = {
  get: function (k) {
    return localStorage.getItem(k);
  },
  set: function (k, v) {
    localStorage.setItem(k, v);
  },
  remove: function (k) {
    localStorage.removeItem(k)
  }
}

function createCookie(){
  var d = new Date();
  d.setTime(d.getTime() + (60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = "timeout" + "=" + "10" + ";" + expires + ";path=/";
}
