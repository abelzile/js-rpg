import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import _ from 'lodash';
import Point from '../point';
import System from '../system';


export default class LevelHeroRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const centerScreenX = Math.floor(screenWidth / scale / 2);
    const centerScreenY = Math.floor(screenHeight / scale / 2);

    const heroEnt = this._entityManager.heroEntity;
    const heroMc = this._pixiContainer.addChild(heroEnt.get('MovieClipComponent').movieClip);
    heroMc.position.set(centerScreenX, centerScreenY);

    const entRefComps = heroEnt.getAll('EntityReferenceComponent');
    const ents = _(entRefComps).map(c => EntityFinders.findById(entities, c.entityId)).compact().value();
    ents.sort(EntitySorters.sortInventory);

    for (const ent of ents) {

      const isVisible = (_.find(entRefComps, c => c.entityId === ent.id)).typeId !== Const.InventorySlot.Backpack;

      if (ent.has('MovieClipComponent')) {

        const pixiObj = this._pixiContainer.addChild(ent.get('MovieClipComponent').movieClip);
        pixiObj.visible = isVisible;
        pixiObj.position.set(centerScreenX, centerScreenY);

      }

      if (ent.has('MeleeAttackComponent')) {

        const pixiObj = this._pixiContainer.addChild(ent.get('MeleeAttackComponent').graphics);
        pixiObj.visible = isVisible;

      }

    }

  }

  processEntities(gameTime, entities) {

    const mobEnts = EntityFinders.findMobs(entities);
    const weaponEnts = EntityFinders.findWeapons(entities);

    this._drawHero(entities);

    this._drawAttack(mobEnts, weaponEnts);

  }

  _drawHero(entities) {

    //TODO:animate hero and equipment
    /*const heroEnt = this._entityManager.heroEntity;
    const heroMc = heroEnt.get('MovieClipComponent').movieClip;
    heroMc.gotoAndStop(0);*/

  }

  _drawAttack(mobEnts, weaponEnts) {

    // This is more just debug right now to show direction of knockback.
    // Eventually it will probably be used to draw some kind of fancy hit effect.
    // Whether it will be a movie clip (probably) or primitives like this, I'm not sure.

    const em = this._entityManager;
    const heroEnt = em.heroEntity;
    const heroWeaponEnt = EntityFinders.findById(weaponEnts, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

    if (!(heroWeaponEnt && heroWeaponEnt.has('MeleeAttackComponent'))) { return; }

    const currentLevelEntity = em.currentLevelEntity;
    const tileMapComponent = currentLevelEntity.get('TileMapComponent');
    const spriteLayer = tileMapComponent.spriteLayers[0];
    const topLeftSprite = spriteLayer[0][0];

    const scale = this._renderer.globalScale;

    const heroAttackComp = heroWeaponEnt.get('MeleeAttackComponent');
    const g = heroAttackComp.graphics;
    g.clear();

    for (const line of heroAttackComp.lines) {

      const startPos = this._translateWorldToScreen(line.point1, topLeftSprite.position);
      const endPos = this._translateWorldToScreen(line.point2, topLeftSprite.position);

      g.lineStyle(1, 0xff0000);
      g.moveTo(startPos.x / scale, startPos.y / scale);
      g.lineTo(endPos.x / scale, endPos.y / scale);

    }

    /*const heroPosComp = heroEnt.get('PositionComponent');

    for (const attackHit of heroAttackComp.attackHits) {

      const mobPosComp = _.find(mobEnts, { id: attackHit.entityId }, this).get('PositionComponent');

      const attackStartTranslatePos = this._translateWorldToScreen(heroPosComp.position, topLeftSprite.position);
      const attackEndTranslatePos = this._translateWorldToScreen(mobPosComp.position, topLeftSprite.position);

      g.lineStyle(1, 0x00ff00);
      g.moveTo(attackStartTranslatePos.x / scale, attackStartTranslatePos.y / scale);
      g.lineTo(attackEndTranslatePos.x / scale, attackEndTranslatePos.y / scale);

    }*/

    g.endFill();

  }

  _translateWorldToScreen(worldPos, screenTopLeftPos) {

    const worldPosX = worldPos.x;
    const worldPosY = worldPos.y;
    const screenTopLeftPxX = screenTopLeftPos.x;
    const screenTopLeftPxY = screenTopLeftPos.y;

    const scale = this._renderer.globalScale;
    const tilePxSize = this._renderer.tilePxSize;

    const topLeftTilePxX = screenTopLeftPxX * scale;
    const topLeftTilePxY = screenTopLeftPxY * scale;

    const pxPosX = worldPosX * scale * tilePxSize;
    const pxPosY = worldPosY * scale * tilePxSize;

    const screenPxPosX = pxPosX + topLeftTilePxX;
    const screenPxPosY = pxPosY + topLeftTilePxY;

    return new Point(screenPxPosX, screenPxPosY);

  }

}
