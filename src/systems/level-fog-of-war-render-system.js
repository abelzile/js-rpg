import * as _ from 'lodash';
import * as Const from '../const';
import System from '../system';
import Vector from '../vector';


export default class LevelFogOfWarRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._pos = new Vector();
    this._centerScreen = new Vector();

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    this._centerScreen.x = Const.ScreenWidth / Const.ScreenScale / 2;
    this._centerScreen.y = Const.ScreenHeight / Const.ScreenScale / 2;
    this._pos.zero();

    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const fogSprites = tileMap.fogOfWarSpriteLayer;

    for (let i = 0; i < fogSprites.length; ++i) {
      this._pixiContainer.addChild(fogSprites[i]);
    }

  }

  processEntities(gameTime, entities) {

    this._drawTiles();

  }

  _drawTiles() {

    const heroPosition = this._entityManager.heroEntity.get('PositionComponent');
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');

    const lenX = tileMap.collisionLayer[0].length;
    const lenY = tileMap.collisionLayer.length;
    const minX = _.clamp(Math.floor(heroPosition.x) - (Const.ViewPortTileWidth / 2), 0, lenX);
    const maxX = _.clamp(minX + Const.ViewPortTileWidth, 0, lenX);
    const minY = _.clamp(Math.floor(heroPosition.y) - (Const.ViewPortTileHeight / 2), 0, lenY);
    const maxY = _.clamp(minY + Const.ViewPortTileHeight, 0, lenY);

    this._calculatePxPos(tileMap.topLeftPos, heroPosition, 0, 0);

    const textureMap = tileMap.textureMap;

    let idx = 0;

    for (let y = minY; y < maxY; ++y) {

      for (let x = minX; x < maxX; ++x) {

        this._calculatePxPos(this._pos, heroPosition, x, y);

        const fogSprite = tileMap.fogOfWarSpriteLayer[idx];
        fogSprite.texture = textureMap[tileMap.fogOfWarLayer[y][x]];
        fogSprite.position.x = this._pos.x;
        fogSprite.position.y = this._pos.y;

        idx++;

      }

    }

  }

  _calculatePxPos(outPos, heroPosition, x, y) {

    const offsetX = x - heroPosition.position.x;
    const offsetY = y - heroPosition.position.y;

    const offsetPxX = offsetX * Const.TilePixelSize;
    const offsetPxY = offsetY * Const.TilePixelSize;

    outPos.x = this._centerScreen.x + offsetPxX;
    outPos.y = this._centerScreen.y + offsetPxY;

  }


}