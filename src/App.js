import React, { Component } from 'react'
import MazimoEditor from './Editor'

import PropTypes from 'prop-types'

class App extends Component {
  render() {
    return (
      <div className="App">
          <MazimoEditor onChange={this.props.onChange} />
      </div>
    );
  }
}

App.propTypes = {
  onChange: PropTypes.func
}

export default App;
