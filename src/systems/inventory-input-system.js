import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';

export default class InventoryInputSystem extends System {

  constructor() {
    super();
    this._gui = null;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    this._gui = EntityFinders.findInventory(entities);
  }

  processEntities(gameTime, entities, input) {

    let exit = input.isPressed(Const.Button.X) || input.isPressed(Const.Button.Esc);

    if (!exit && input.isPressed(Const.Button.LeftMouse)) {
      exit = this._gui.get('DialogHeaderComponent').closeBtnContainsPoint(input.getMousePosition());
    }

    if (exit) {
      this.emit('inventory-input-system.exit', entities);
    }

  }

}