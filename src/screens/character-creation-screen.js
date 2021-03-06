import AbilitiesScreen from './abilities-screen';
import CharacterCreationInputSystem from '../systems/character-creation-input-system';
import CharacterCreationRenderSystem from '../systems/character-creation-render-system';
import CharacterCreationUpdateSystem from '../systems/character-creation-update-system';
import LevelScreen from './level-screen';
import LoadingScreen from './loading-screen';
import Screen from '../screen';

export default class CharacterCreationScreen extends Screen {
  constructor() {
    super();

    this._inputSystem = null;
    this._updateSystem = null;
    this._renderSystems = null;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._renderSystems = [new CharacterCreationRenderSystem(this, renderer, entityManager)];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities);
    }

    this._inputSystem = new CharacterCreationInputSystem(entityManager).once('next', firstLevelName => {
      const levelScreen = new LevelScreen('world', firstLevelName);
      const abilitiesScreen = new AbilitiesScreen(levelScreen);

      LoadingScreen.load(this.screenManager, true, [levelScreen, abilitiesScreen]);
    });
    this._inputSystem.initialize(entities);

    this._updateSystem = new CharacterCreationUpdateSystem(renderer, entityManager);
    this._updateSystem.initialize(entities);
  }

  unload(entities) {
    this._inputSystem.removeAllListeners();
    this._updateSystem.removeAllListeners();
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    this._updateSystem.process(gameTime, entities);
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);

    this._inputSystem.process(gameTime, entities, input);
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);

    for (const renderSys of this._renderSystems) {
      renderSys.process(gameTime, entities);
    }
  }
}
