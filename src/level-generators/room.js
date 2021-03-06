import Rectangle from '../rectangle';

export default class Room extends Rectangle {

  constructor(x = 0, y = 0, width = 1, height = 1, explored = false) {
    super(x, y, width, height);
    this.explored = explored;
  }

  clone() {
    return new Room(this.x, this.y, this.width, this.height, this.explored);
  }

}