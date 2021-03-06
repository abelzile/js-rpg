import * as Const from './const';
import Vector from './vector';

export default class Input {
  constructor(renderer) {
    this._canvasRect = !renderer.view ? { top: 0, left: 0 } : renderer.view.getBoundingClientRect();
    this._buttonDownState = Object.create(null);
    this._buttonPressedState = Object.create(null);
    this._mousePosition = new Vector(-1, -1);

    this._handlers = Object.create(null);
    this._handlers.keydown = e => {
      e.preventDefault();
      this._down(e.keyCode);
    };
    this._handlers.keyup = e => {
      e.preventDefault();
      this._up(e.keyCode);
    };
    this._handlers.mousedown = e => {
      e.preventDefault();
      this._down(this._getMouseButton(e));
    };
    this._handlers.mouseup = e => {
      e.preventDefault();
      this._up(this._getMouseButton(e));
    };
    this._handlers.mousemove = e => {
      e.preventDefault();
      this._mouseMove(e);
    };

    for (const h in this._handlers) {
      document.addEventListener(h, this._handlers[h], false);
    }
  }

  removeAllListeners() {
    for (const h in this._handlers) {
      document.removeEventListener(h, this._handlers[h], false);
    }
  }

  update() {
    for (const v in this._buttonPressedState) {
      if (this._buttonPressedState[v] === true) {
        this._buttonPressedState[v] = false;
      }
    }
  }

  clear() {
    for (const v in this._buttonDownState) {
      this._buttonDownState[v] = false;
    }
    for (const v in this._buttonPressedState) {
      this._buttonPressedState[v] = undefined;
    }
  }

  isDown(button) {
    return this._buttonDownState[button] || false;
  }

  isPressed(button) {
    return this._buttonPressedState[button] || false;
  }

  getMousePosition() {
    return this._mousePosition;
  }

  _down(buttonId) {
    this._buttonDownState[buttonId] = true;

    if (this._buttonPressedState[buttonId] === undefined) {
      this._buttonPressedState[buttonId] = true;
    }
  }

  _up(buttonId) {
    this._buttonDownState[buttonId] = false;

    if (this._buttonPressedState[buttonId] === false) {
      this._buttonPressedState[buttonId] = undefined;
    }
  }

  _getMouseButton(e) {
    if (e.which !== undefined || e.button !== undefined) {
      if (e.which === 1 || e.button === 0) {
        return Const.Button.LeftMouse;
      }

      if (e.which === 2 || e.button === 1) {
        return Const.Button.MiddleMouse;
      }

      if (e.which === 3 || e.button === 2) {
        return Const.Button.RightMouse;
      }
    }

    throw new Error('Unknown mouse button.');
  }

  _mouseMove(e) {
    let x = 0;
    let y = 0;

    if (!e) {
      e = window.event;
    }

    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    } else if (e.clientX || e.clientY) {
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    this._mousePosition.x = x - this._canvasRect.left;
    this._mousePosition.y = y - this._canvasRect.top;
  }
}
