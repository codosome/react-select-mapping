import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './style.scss'

export default class Application extends React.Component{
  constructor(props){
    super(props)

  }

  render() {
    return (
      <MuiThemeProvider>
        {this.props.children}
      </MuiThemeProvider>
    )
  }
}
