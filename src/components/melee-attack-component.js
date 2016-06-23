import Pixi from 'pixi.js';
import _ from 'lodash';
import Component from '../component';
import Point from '../point';
import Line from '../line';
import AttackHit from '../attack-hit';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';


export default class MeleeAttackComponent extends Component {

  constructor() {

    super();

    this.origin = new Point();
    this.position = new Point();
    this.length = 0;
    this.remainingTime = 0;
    this.damage = 0;
    this.knockBackDuration = 0;

    this.attackMainAngle = 0;
    this.attackMainLine = new Line();

    this.attackArcAngle = 0;

    this.firstLineAngle = 0;

    this.lines = [];

    this.attackHits = [];

    this.graphics = new Pixi.Graphics();

    this.reset();

  }

  get hasRemainingAttack() { return this.remainingTime > 0; }

  init(origin, position, length, attackArc, remainingTime, damage, knockBackDuration) {

    this.origin.x = origin.x;
    this.origin.y = origin.y;
    this.position.x = position.x;
    this.position.y = position.y;
    this.length = length;
    this.remainingTime = remainingTime;
    this.damage = damage;
    this.knockBackDuration = knockBackDuration;

    this.attackMainAngle = Math.atan2(this.position.y - this.origin.y, this.position.x - this.origin.x);
    this.attackMainLine.point1.x = this.origin.x;
    this.attackMainLine.point1.y = this.origin.y;
    this.attackMainLine.point2.x = this.origin.x + this.length * Math.cos(this.attackMainAngle);
    this.attackMainLine.point2.y = this.origin.y + this.length * Math.sin(this.attackMainAngle);

    this.attackArcAngle = attackArc;

    this.firstLineAngle = this.attackMainAngle - (this.attackArcAngle / 2);

    let divisions = this._getAttackDivisions();
    let angleChunk = this.attackArcAngle / divisions;
    let curAngleChunk = this.firstLineAngle;

    for (let i = 0; i <= divisions; ++i) {

      this.lines.push(
        new Line(
          this.origin.x,
          this.origin.y,
          this.origin.x + this.length * Math.cos(curAngleChunk),
          this.origin.y + this.length * Math.sin(curAngleChunk)
        )
      );

      curAngleChunk += angleChunk;

    }

    this.graphics.clear();

  }

  decrementBy(time) {

    if (this.remainingTime > 0.0) {

      this.remainingTime -= time;

      if (this.remainingTime <= 0.0) {
        this.reset();
      }

    }

  }

  addHit(entityId, angle) {
    this.attackHits.push(new AttackHit(entityId, angle));
  }

  reset() {

    this.origin.zero();
    this.position.zero();
    this.length = 0;
    this.remainingTime = 0;

    this.attackMainAngle = 0;
    this.attackMainLine.zero();

    this.attackArcAngle = 0;

    this.firstLineAngle = 0;

    ArrayUtils.clear(this.lines);
    ArrayUtils.clear(this.attackHits);

    this.graphics.clear();

  }

  containsHitEntityId(id) {
    return _.some(this.attackHits, {entityId: id});
  }

  findHitEntityObj(id) {
    return _.find(this.attackHits, (hitObj) => hitObj.entityId === id);
  }

  clone() {
    return new MeleeAttackComponent();
  }

  _getAttackDivisions() {

    if (this.attackArcAngle > 0 && this.attackArcAngle <= Const.RadiansOf45Degrees) {
      return 5;
    }

    if (this.attackArcAngle > Const.RadiansOf45Degrees && this.attackArcAngle <= Const.RadiansOf90Degrees) {
      return 10;
    }

    if (this.attackArcAngle > Const.RadiansOf90Degrees && this.attackArcAngle <= Const.RadiansOf180Degrees) {
      return 20;
    }

    if (this.attackArcAngle > Const.RadiansOf180Degrees && this.attackArcAngle <= Const.RadiansOf270Degrees) {
      return 30;
    }

    if (this.attackArcAngle > Const.RadiansOf270Degrees && this.attackArcAngle <= Const.RadiansOf360Degrees) {
      return 40;
    }

    return 50;

  }

}
