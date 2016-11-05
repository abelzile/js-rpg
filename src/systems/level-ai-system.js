import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import _ from 'lodash';
import Line from '../line';
import Point from '../point';
import System from '../system';


export default class LevelAiSystem extends System {

  constructor(renderer, entityManager) {
    
    super();

    this.renderer = renderer;
    this.entityManager = entityManager;
    
  }
  
  processEntities(gameTime, ents) {

    const mobs = this.aiEntitiesToProcess();

    for (let i = 0; i < mobs.length; ++i) {

      const mob = mobs[i];

      this.processEnteringState(mob, ents);

      this.processState(gameTime, mob, ents);

    }

  }
  
  hitByWeapon(entity, weaponEnt) {
    
    return entity &&
      weaponEnt &&
      weaponEnt.has('MeleeAttackComponent') &&
      weaponEnt.get('MeleeAttackComponent').containsHitEntityId(entity.id);
    
  }
  
  canSee(currentLevelEnt, attackerEnt, targetEnt) {

    const sourcePositionComp = attackerEnt.get('PositionComponent');
    const targetPositionComp = targetEnt.get('PositionComponent');

    const lineBetween = new Line(Math.round(sourcePositionComp.position.x),
                                 Math.round(sourcePositionComp.position.y),
                                 Math.round(targetPositionComp.position.x),
                                 Math.round(targetPositionComp.position.y));

    const collisionLayer = currentLevelEnt.get('TileMapComponent').collisionLayer;

    return !_.some(lineBetween.calculateBresenham(), point => collisionLayer[point.y][point.x] > 0);

  }
   
  isInRange(attackerEnt, targetEnt, range) {

    const targetCurrentBoundingRect = targetEnt.get('BoundingRectangleComponent').rectangle.getOffsetBy(targetEnt.get('PositionComponent').position);
    const targetCurrentBoundingCenterPoint = targetCurrentBoundingRect.getCenter();

    const sourceCurrentBoundingRect = attackerEnt.get('BoundingRectangleComponent').rectangle.getOffsetBy(attackerEnt.get('PositionComponent').position);
    const sourceCurrentBoundingCenterPoint = sourceCurrentBoundingRect.getCenter();

    // 1. get line from sourceCurrentBoundingCenterPoint to targetCurrentBoundingCenterPoint that is length of mob weapon attack.

    const testHitAngle = Math.atan2(targetCurrentBoundingCenterPoint.y - sourceCurrentBoundingCenterPoint.y,
                                    targetCurrentBoundingCenterPoint.x - sourceCurrentBoundingCenterPoint.x);

    const testLine = new Line(sourceCurrentBoundingCenterPoint.x,
                              sourceCurrentBoundingCenterPoint.y,
                              sourceCurrentBoundingCenterPoint.x + range * Math.cos(testHitAngle),
                              sourceCurrentBoundingCenterPoint.y + range * Math.sin(testHitAngle));

    // 2. check if attack could hit by seeing if line intersects any of hero's targetCurrentBoundingRect lines
    // (Also potentially check each end of the testLine if required in case of a weapon with a very short attack
    // that falls entirely in the mob bounding rect). If yes, do attack officially on the line from step 1, if not, don't.

    return targetCurrentBoundingRect.intersectsWith(testLine) ||
           targetCurrentBoundingRect.intersectsWith(testLine.point1) ||
           targetCurrentBoundingRect.intersectsWith(testLine.point2);

  }

  meleeWeaponAttack(attacker, target, attackImplement) {

    const attackerPosition = attacker.get('PositionComponent');
    const targetPosition = target.get('PositionComponent');
    const attackImplementStats = attackImplement.getAllKeyed('StatisticComponent', 'name');
    const meleeAttack = attackImplement.get('MeleeAttackComponent');
    meleeAttack.init(new Point(attackerPosition.position.x + 0.5, attackerPosition.position.y + 0.5),
                     new Point(targetPosition.position.x + 0.5, targetPosition.position.y + 0.5),
                     attackImplementStats[Const.Statistic.Range].currentValue,
                     attackImplementStats[Const.Statistic.Arc].currentValue,
                     attackImplementStats[Const.Statistic.Duration].currentValue,
                     attackImplementStats[Const.Statistic.Damage].currentValue,
                     attackImplementStats[Const.Statistic.KnockBackDuration].currentValue);

    const hitAngle = Math.atan2(targetPosition.position.y - attackerPosition.position.y,
                                targetPosition.position.x - attackerPosition.position.x);

    meleeAttack.addHit(target.id, hitAngle);

  }

  rangedWeaponAttack(attacker, target, attackImplement, attackImplementCompName) {

    //TODO: try to make more accurate (get rid of rangeAllowance which is a fudge to get around the slight differences between how range is calculated here and in isInRange).
    
    let targetPos;
    let rangeAllowance = 0;

    switch (target.constructor.name) {

      case 'Entity': {

        targetPos = target.get('PositionComponent').position;
        rangeAllowance = target.get('BoundingRectangleComponent').rectangle.getDiagonalLength() / 2;

        break;

      }
      case 'Point':
      case 'Vector': {

        targetPos = target;

        break;

      }
      default: {

        throw new Error('target arg required.');

      }

    }

    const attackImplementStats = attackImplement.getAllKeyed('StatisticComponent', 'name');
    const attackImplementComp = attackImplement.get(attackImplementCompName);

    const projectile = this.entityManager.buildFromProjectileTemplate(attackImplementComp.projectileType);
    this.entityManager.add(projectile);

    const attackerPosition = attacker.get('PositionComponent');

    const projectilePosition = projectile.get('PositionComponent');
    projectilePosition.position.setFrom(attackerPosition.position);

    const projectileAttack = projectile.get('ProjectileAttackComponent');
    projectileAttack.init(attacker.id,
                          projectilePosition.position,
                          targetPos,
                          attackImplementStats[Const.Statistic.Range].currentValue + rangeAllowance,
                          attackImplementStats[Const.Statistic.Damage].currentValue,
                          attackImplementStats[Const.Statistic.KnockBackDuration].currentValue);

    console.log(projectileAttack.angle);

    const projectileMovement = projectile.get('MovementComponent');
    projectileMovement.movementAngle = projectileAttack.angle;
    projectileMovement.velocityVector.zero();
    projectileMovement.directionVector.x = Math.cos(projectileMovement.movementAngle);
    projectileMovement.directionVector.y = Math.sin(projectileMovement.movementAngle);

    if (attackImplement.has('RangedAttackComponent')) {
      attackImplement.get('RangedAttackComponent').angle = projectileAttack.angle;
    }

  }

  trySpendSpellPoints(attackerEnt, attackImplementEnt) {

    const statEffectComps = attackImplementEnt.getAll('StatisticEffectComponent');
    const mobStatCompsMap = attackerEnt.getAllKeyed('StatisticComponent', 'name');
    const magicPointsComp = mobStatCompsMap[Const.Statistic.MagicPoints];
    const spellPoints = magicPointsComp.currentValue;
    const spellCost = _.find(statEffectComps, c => c.name === Const.Statistic.MagicPoints).value;

    if (spellPoints >= Math.abs(spellCost)) {

      magicPointsComp.currentValue += spellCost;

      return true;

    } else {

      return false; // can't cast. not enough mp.

    }

  }

  selectAttackImplement(attackEnt, ents) {

    const weaponHandRefComp = attackEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1);
    const memoryRefComp = attackEnt.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory);

    let weapon;
    if (weaponHandRefComp) {
      weapon = EntityFinders.findById(ents, weaponHandRefComp.entityId);
    }

    let spell;
    if (memoryRefComp) {

      spell = EntityFinders.findById(ents, memoryRefComp.entityId);

      if (spell.has('RangedMagicSpellComponent')) {

        const attackerMpStatComp = attackEnt.getAll('StatisticComponent', c => c.name === Const.Statistic.MagicPoints);
        const spellPoints = attackerMpStatComp.currentValue;

        const spellCostComp = spell.getAll('StatisticEffectComponent', c => c.name === Const.Statistic.MagicPoints);
        const spellCost = spellCostComp.value;

        if (spellPoints < Math.abs(spellCost)) {
          spell = undefined;  // can't cast. not enough mp.
        }

      } else {

        // not ranged, at present not an attack spell.
        spell = undefined;

      }

    }

    //TODO: determine how to select best attack implement.

    if (spell) { return spell; }

    return weapon;

  }

  canBeAttacked(entity) {

    const aiComp = entity.get('AiComponent');

    if (!aiComp) { throw new Error('AI component not found.'); }

    switch (aiComp.constructor.name) {

      case 'HeroComponent':
        return aiComp.state !== HeroComponent.State.KnockingBack;
      case 'AiRandomWandererComponent':
        return aiComp.state !== AiRandomWandererComponent.State.KnockingBack;
      case 'AiSeekerComponent':
        return aiComp.state !== AiSeekerComponent.State.KnockingBack;
      default:
        throw new Error('Unknown AI component: ' + aiComp.constructor.name);

    }

  }

  faceHero(mob, hero) {

    const mobFacing = mob.get('FacingComponent');
    const mobPosition = mob.get('PositionComponent');
    const heroPosition = hero.get('PositionComponent');

    if (mobPosition.x < heroPosition.x) {
      mobFacing.facing = Const.Direction.East;
    } else if (mobPosition.x > heroPosition.x) {
      mobFacing.facing = Const.Direction.West;
    }

  }

}
