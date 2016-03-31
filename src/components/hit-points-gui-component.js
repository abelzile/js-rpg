import Component from '../component';
import Pixi from 'pixi.js';


export default class HitPointsGuiComponent extends Component {

  constructor(texture) {

    super();

    this._texture = texture;
    this._barGraphics = new Pixi.Graphics();
    this._barIconSprite = new Pixi.Sprite(this._texture);

  }

  get barGraphics() { return this._barGraphics; }

  get barIconSprite() { return this._barIconSprite; }

  clone() {
    return new HitPointsGuiComponent(this._texture);
  }

}
