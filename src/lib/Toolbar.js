import Portal from 'react-portal'
import React from 'react'
import PropTypes from 'prop-types'

class Toolbar extends React.Component {

  state = {
  }
  /**
   * When selection changes, update the menu.
   */
  componentDidUpdate = (prevProps) => {
    // Only update position of tooltip if selection from parent changed
    if (prevProps.document.selection.focusOffset !== this.props.document.selection.focusOffset) {
      this.updateMenu()
    }
  }

  onChange(change) {
    this.props.onChange(change)
    // There is a lag between SlateJS selection and browser selection
    // I don't know from where it's coming
    // But the updated state which comes from Editor Component it's not the final form
    // Somewhere between parent and this child a selection state is lost
    // This does the trick to update the toolbar position into the correct position
    // Because checks after all React job was done
    setTimeout(() => {
      this.updateMenu()
    },0)
  }

  /**
   * When the portal opens, cache the menu element.
   *
   * @param {Element} portal
   */

  onOpen = (portal) => {
    this.setState({ menu: portal })
  }

    /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasBlock = (type) => {
    const state = this.props.document
    return state.blocks.some(mark => mark.type === type)
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickBlock = (e, type) => {
    e.preventDefault()
    const change = this.props.document.change()
    
    if (this.hasBlock(type)) {
      change.setBlock('paragraph')
    } else {
      change.setBlock(type)
    }
    
    this.onChange(change)
  }

  /**
   * Render a block-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */
  renderBlockButton = (type, icon) => {
    const isActive = this.hasBlock(type)
    const onMouseDown = e => this.onClickBlock(e, type)

    return (
      <li className={`editor-menu-button ${isActive ? ' active' : ''}`} onMouseDown={onMouseDown}>
        <span className={`fa fa-${icon}`} />
      </li>
    )
  }

  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasMark = (type) => {
    const state = this.props.document
    return state.activeMarks.some(mark => mark.type === type)
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickMark = (e, type) => {
    e.preventDefault()
    const change = this.props.document.change().toggleMark(type)
    this.onChange(change)
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type)
    const onMouseDown = e => this.onClickMark(e, type)

    return (
      <li className={`editor-menu-button ${isActive ? ' active' : ''}`} onMouseDown={onMouseDown}>
        <span className={`fa fa-${icon}`} />
      </li>
    )
  }

  /**
   * Update the menu's absolute position.
   */

  updateMenu = () => {
    const { menu } = this.state
    const state = this.props.document
    if (!menu) return
    const menuContainer = menu.querySelector('.editor-menu')
    if (!menuContainer) return

    if (state.isBlurred || state.isEmpty) {
      menuContainer.classList.remove('editor-menu--active')
      menuContainer.removeAttribute('style')
      return
    }

    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    menuContainer.classList.add('editor-menu--active')
    menuContainer.style.top = `${rect.top + window.scrollY - menuContainer.offsetHeight - 8}px`
    menuContainer.style.left = `${rect.left + window.scrollX - menuContainer.offsetWidth / 2 + rect.width / 2}px`

  }
  
  render() {
    return (
      <Portal isOpened onOpen={this.onOpen}>
        <div className="editor-menu">
          <div className="editor-menu-linkinput">
            <input className="editor-menu-input" placeholder="Paste or type a link" />
            <div className="editor-menu-button"></div>
          </div>
          <ul className="editor-menu-buttons">
            {this.renderBlockButton('heading2', 'header')}
            <li className="editor-menu-divider"></li>
            {this.renderMarkButton('bold', 'bold')}
            {this.renderMarkButton('italic', 'italic')}
            {this.renderMarkButton('underlined', 'underline')}
            {this.renderMarkButton('code', 'code')}
          </ul>
        </div>
      </Portal>
    )
  }
}

Toolbar.propTypes = {
  document: PropTypes.object,
  onChange: PropTypes.func
}

export default Toolbar