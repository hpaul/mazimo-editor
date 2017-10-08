import { Editor } from 'slate-react'
import MarkdownPlugin from 'slate-markdown';
import Plain from 'slate-plain-serializer'

import React from 'react'
import PropTypes from 'prop-types'

import Toolbar from './Toolbar'

const markdown = MarkdownPlugin();

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
  nodes: {
    'block-quote': props => <blockquote>{props.children}</blockquote>,
    'bulleted-list': props => <ul>{props.children}</ul>,
    'heading1': props => <h1>{props.children}</h1>,
    'heading2': props => <h2>{props.children}</h2>,
    'heading-three': props => <h3>{props.children}</h3>,
    'heading-four': props => <h4>{props.children}</h4>,
    'heading-five': props => <h5>{props.children}</h5>,
    'heading-six': props => <h6>{props.children}</h6>,
    'list-item': props => <li>{props.children}</li>,
  },
  marks: {
    heading1: (props) => <h1>{props.children}</h1>,
    heading2: (props) => <h2>{props.children}</h2>,
    bold: (props) => <b>{props.children}</b>,
    italic: (props) => <i>{props.children}</i>,
    code: (props) => <code>{props.children}</code>,
    'hr': {
      borderBottom: '1px solid #000',
      display: 'block',
      opacity: 0.2
    },
    underlined: (props) => <u>{props.children}</u>
  }
}

/**
 * MazimEditor with markdown capabilities
 *
 * @type {Component}
 */

class MazimoEditor extends React.Component {

  /**
   * Deserialize the raw initial state.
   *
   * @type {Object}
   */

  constructor(props) {
    super(props)

    this.setState({
      document: Plain.deserialize(props.initialContent || '')
    })
  }

  /**
   * Get the block type for a series of auto-markdown shortcut `chars`.
   *
   * @param {String} chars
   * @return {String} block
   */

  getType = (chars) => {
    switch (chars) {
      case '*':
      case '-':
      case '+': return 'list-item'
      case '>': return 'block-quote'
      default: return null
    }
  }

  /**
   *
   * Render editor
   *
   * @return {Component} component
   */

  render() {
    return (
      <div className="editor">
        <Toolbar document={this.state.document} onChange={this.onChange} />
        <div className="editor-container">
          <Editor
            schema={schema}
            state={this.state.document}
            plugins={[ markdown ]}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
          />
        </div>
      </div>
    )
  }


  /**
   * On change.
   *
   * @param {Change} change
   */

  onChange = ({ state }) => {
    // This send document only if a change in text was made
    if (state.document !== this.state.document.document) {
      // Send plain text back, since it's the editor job
      const text = Plain.serialize(state)
      this.props.onChange(text)
    }
    
    this.setState({ document: state })
  }

  /**
   * On key down, check for our specific key shortcuts.
   *
   * @param {Event} e
   * @param {Data} data
   * @param {Change} change
   */

  onKeyDown = (e, data, change) => {
    switch (data.key) {
      case 'space': return this.onSpace(e, change)
      case 'backspace': return this.onBackspace(e, change)
      case 'enter': return this.onEnter(e, change)
      default: return ;
    }
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   *
   * @param {Event} e
   * @param {State} change
   * @return {State or Null} state
   */

  onSpace = (e, change) => {
    const { state } = change
    if (state.isExpanded) return

    const { startBlock, startOffset } = state
    const chars = startBlock.text.slice(0, startOffset).replace(/\s*/g, '')
    const type = this.getType(chars)

    if (!type) return
    if (type === 'list-item' && startBlock.type === 'list-item') return
    e.preventDefault()

    change.setBlock(type)

    if (type === 'list-item') {
      change.wrapBlock('bulleted-list')
    }

    change
      .extendToStartOf(startBlock)
      .delete()

    return true
  }

  /**
   * On backspace, if at the start of a non-paragraph, convert it back into a
   * paragraph node.
   *
   * @param {Event} e
   * @param {State} change
   * @return {State or Null} state
   */

  onBackspace = (e, change) => {
    const { state } = change
    if (state.isExpanded) return
    if (state.startOffset !== 0) return

    const { startBlock } = state
    if (startBlock.type === 'paragraph') return

    e.preventDefault()
    change.setBlock('paragraph')

    if (startBlock.type === 'list-item') {
      change.unwrapBlock('bulleted-list')
    }

    return true
  }

  /**
   * On return, if at the end of a node type that should not be extended,
   * create a new paragraph below it.
   *
   * @param {Event} e
   * @param {State} change
   * @return {State or Null} state
   */

  onEnter = (e, change) => {
    const { state } = change
    if (state.isExpanded) return

    const { startBlock, startOffset, endOffset } = state
    if (startOffset === 0 && startBlock.text.length === 0) return this.onBackspace(e, change)
    if (endOffset !== startBlock.text.length) return

    if (
      startBlock.type !== 'heading1' &&
      startBlock.type !== 'heading2' &&
      startBlock.type !== 'heading-three' &&
      startBlock.type !== 'heading-four' &&
      startBlock.type !== 'heading-five' &&
      startBlock.type !== 'heading-six' &&
      startBlock.type !== 'block-quote'
    ) {
      return
    }

    e.preventDefault()

    change
      .splitBlock()
      .setBlock('paragraph')

    return true
  }

}

MazimoEditor.propTypes = {
  onChange: PropTypes.func
}

/**
 * Export.
 */

export default MazimoEditor