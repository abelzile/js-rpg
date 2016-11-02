'use strict';
import * as Const from '../const';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MeleeAttackComponent from '../components/melee-attack-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import RangedMagicSpellComponent from '../components/ranged-magic-spell-component';
import SelfMagicSpellComponent from '../components/self-magic-spell-component';
import StatisticComponent from '../components/statistic-component';
import StatisticEffectComponent from '../components/statistic-effect-component';
import * as ScreenUtils from '../utils/screen-utils';
import Point from '../point';
import GraphicsComponent from '../components/graphics-component';


const funcMap = Object.create(null);

funcMap[Const.MagicSpell.Fireball] = function(magicSpellType, resources) {

  const magicSpellTexture = resources['magic_spells'].texture;

  const frames = [
    new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(0, 0, 16, 16));
  
  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.MagicSpellSlot.Memory, Const.MagicSpellSlot.SpellBook))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    .add(new RangedMagicSpellComponent(magicSpellType, Const.Projectile.Fireball))
    .add(new StatisticComponent(Const.Statistic.Acceleration, .1))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    .add(new StatisticComponent(Const.Statistic.CastingDuration, 1000))
    .add(new StatisticComponent(Const.Statistic.Range, 8))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 200))
    .add(new StatisticEffectComponent(Const.Statistic.MagicPoints, -5, 1, Const.TargetType.Self, Const.StatisticEffectValue.Current))
    ;

};

funcMap[Const.MagicSpell.IceShard] = function(magicSpellType, resources) {

  const magicSpellTexture = resources['magic_spells'].texture;

  const frames = [
    new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(16, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(16, 0, 16, 16));

  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.MagicSpellSlot.Memory, Const.MagicSpellSlot.SpellBook))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    .add(new RangedMagicSpellComponent(magicSpellType, Const.Projectile.IceShard))
    .add(new StatisticComponent(Const.Statistic.Acceleration, .1))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    .add(new StatisticComponent(Const.Statistic.CastingDuration, 1000))
    .add(new StatisticComponent(Const.Statistic.Range, 8))
    ;

};

funcMap[Const.MagicSpell.Heal] = function(magicSpellType, resources) {

  const magicSpellTexture = resources['magic_spells'].texture;

  const frames = [
    new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(48, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(48, 0, 16, 16));

  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.MagicSpellSlot.Memory, Const.MagicSpellSlot.SpellBook))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    .add(new SelfMagicSpellComponent(magicSpellType))
    .add(new StatisticComponent(Const.Statistic.CastingDuration, 500))
    .add(new StatisticEffectComponent(Const.Statistic.HitPoints, 10, 1, Const.TargetType.Self, Const.StatisticEffectValue.Current))
    .add(new StatisticEffectComponent(Const.Statistic.MagicPoints, -5, 1, Const.TargetType.Self, Const.StatisticEffectValue.Current))
    ;

};

funcMap[Const.MagicSpell.LightningBolt] = function(magicSpellType, resources) {

  const magicSpellTexture = resources['magic_spells'].texture;

  const frames = [
    new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(32, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(32, 0, 16, 16));

  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.MagicSpellSlot.Memory, Const.MagicSpellSlot.SpellBook))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    .add(new RangedMagicSpellComponent(magicSpellType, Const.Projectile.LightningBolt))
    .add(new StatisticComponent(Const.Statistic.Acceleration, .1))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    .add(new StatisticComponent(Const.Statistic.CastingDuration, 1000))
    .add(new StatisticComponent(Const.Statistic.Range, 8))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 200))
    .add(new StatisticEffectComponent(Const.Statistic.MagicPoints, -5, 1, Const.TargetType.Self, Const.StatisticEffectValue.Current))
    ;

};

funcMap[Const.MagicSpell.Charge] = function(magicSpellType, resources) {

  const magicSpellTexture = resources['magic_spells'].texture;

  const frames = [
    new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(64, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(64, 0, 16, 16));

  const duration = 300;

  //0x0070c0
  //0x3f90cf
  //0x3fa9cf

  return new Entity()
    .add(new GraphicsComponent())
    .add(new InventoryIconComponent(iconTexture, Const.MagicSpellSlot.Memory, Const.MagicSpellSlot.SpellBook))
    .add(new LevelIconComponent(iconTexture))
    .add(new MeleeAttackComponent())
    .add(new SelfMagicSpellComponent(magicSpellType, function (self, mouseWorldPosition, mouseScreenPosition) {

      const m = self.get('MovementComponent');
      const p = self.get('PositionComponent');
      m.movementAngle = Math.atan2(mouseWorldPosition.y - p.position.y, mouseWorldPosition.x - p.position.x);
      m.velocityVector.zero();
      m.directionVector.x = Math.cos(m.movementAngle);
      m.directionVector.y = Math.sin(m.movementAngle);

      const attack = this.get('MeleeAttackComponent');

      if (attack) {

        const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
        const heroAttackOriginOffset = new Point(p.x + .5, p.y + .5);
        const mouseAttackOriginOffset = new Point(mouseScreenPosition.x - halfTile, mouseScreenPosition.y - halfTile);
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mouseAttackOriginOffset, p.position);
        const stats = this.getAllKeyed('StatisticComponent', 'name');

        attack.init(heroAttackOriginOffset,
                    mouseTilePosition,
                    stats[Const.Statistic.Range].currentValue,
                    stats[Const.Statistic.Arc].currentValue,
                    stats[Const.Statistic.Duration].currentValue,
                    stats[Const.Statistic.Damage].currentValue,
                    stats[Const.Statistic.KnockBackDuration].currentValue);

      }

    }, Const.AttackShape.Stab, 0x5dfffd))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf180Degrees))
    .add(new StatisticComponent(Const.Statistic.CastingDuration, 1000))
    .add(new StatisticComponent(Const.Statistic.Damage, 5))
    .add(new StatisticComponent(Const.Statistic.Duration, 300))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 500))
    .add(new StatisticComponent(Const.Statistic.Range, 1))
    .add(new StatisticEffectComponent(Const.Statistic.Acceleration,
      .2,
      duration,
      Const.TargetType.Self,
      Const.StatisticEffectValue.Current,
      Const.EffectTimeType.Temporary,
      function () {
        const m = this.get('MovementComponent');
        m.directionVector.zero();
        m.movementAngle = 0;
      }))
    .add(new StatisticEffectComponent(Const.Statistic.MagicPoints, -5, 1, Const.TargetType.Self, Const.StatisticEffectValue.Current))
    ;


};

export function buildMagicSpell(magicSpellType, resources) {

  const func = funcMap[magicSpellType];
  
  if (!func) { throw new Error('No factory method found for magicSpellType: "' + magicSpellType + '".'); }
  
  return func(magicSpellType, resources);

}