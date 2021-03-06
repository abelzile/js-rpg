import Component from '../component';

export default class ExitComponent extends Component {
  constructor(position, toLevelName, toLevelType = '') {
    super();
    this.position = position;
    this.toLevelName = toLevelName;
    this.toLevelType = toLevelType;
  }

  get x() {
    return this.position.x;
  }
  set x(value) {
    this.position.x = value;
  }

  get y() {
    return this.position.y;
  }
  set y(value) {
    this.position.y = value;
  }

  clone() {
    return new ExitComponent(this.position, this.toLevelName, this.toLevelType);
  }
}
