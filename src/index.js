import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import Editor from './Editor';

class MazimoEditor {
  constructor(element, options) {
    this.element = element
    this.onChange = options.onChange
  }

  render() {
    this.holder = ReactDOM.render(<Editor onChange={this.onChange} />, this.element);
  }
}

// Just for dev purpose
// const $editor = document.getElementById('root')
// const editor = new MazimoEditor($editor, {
//   onChange: ({ state }) => {
//     console.log(state.document)
//   }
// })

// editor.render()

export default MazimoEditor
