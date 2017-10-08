import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
//import App from './App';
import Editor from './Editor';

class MazimoEditor {
  constructor(element, options) {
    this.element = element
    this.onChange = options.onChange
    this.initialContent = options.initialContent
  }

  render() {
    this.holder = ReactDOM.render(<Editor onChange={this.onChange} initialContent={this.initialContent} />, this.element);
  }
}

// Just for dev purpose
// const $editor = document.getElementById('root')
// const editor = new MazimoEditor($editor, {
//   onChange: (text) => {
//     console.log(text)
//   }
// })

// editor.render()

export default MazimoEditor
