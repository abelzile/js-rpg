import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as Pixi from 'pixi.js';
import * as PixiFilters from 'pixi-filters';
import DialogRenderSystem from './dialog-render-system';

export default class AbilitiesRenderSystem extends DialogRenderSystem {
  constructor(pixiContainer, renderer, entityManager) {
    super(pixiContainer, renderer);

    this.AttributeDisplayOrder = [
      Const.Attribute.Strengh,
      Const.Attribute.Endurance,
      Const.Attribute.Intelligence,
      Const.Attribute.Agility
    ];

    this._attributeDisplaySortFunc = (a, b) =>
      this.AttributeDisplayOrder.indexOf(a.name) - this.AttributeDisplayOrder.indexOf(b.name);

    this._entityManager = entityManager;

    this._headingGrid = null;
    this._skillSlotGrid = null;

    this._attributePointsHeading = null;
    this._skillPointsHeading = null;

    this._heroCharacterClass = null;
    this._heroSkillGroups = null;

    this._redrawMemorizedSkill = false;
    this._redrawLearnedSkills = false;
    this._redrawAttributes = false;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const gui = EntityFinders.findAbilitiesGui(entities);

    super.initialize(gui.get('DialogHeaderComponent'));

    const headings = gui.getAllKeyed('TextComponent', 'id');

    this._drawAttributesHeadings(headings);
    this._drawSkillsHeadings(headings);
    this._drawAttributes(headings, gui, entities);
    this._drawSkills(gui, entities);
    this._drawOtherButtons(gui.getAllKeyed('TextButtonComponent', 'id'));

    this.pixiContainer.addChild(gui.get('GraphicsComponent').graphics);

    this._redrawMemorizedSkill = true;
  }

  processEntities(gameTime, entities) {
    const gui = EntityFinders.findAbilitiesGui(entities);
    const hero = this._entityManager.heroEntity;

    if (this._redrawLearnedSkills) {
      this._redrawLearnedSkills = false;

      const heroCharClass = this._getHeroCharacterClass(hero, entities);
      const stats = hero.getAllKeyed('StatisticComponent', 'name');
      const skillPoints = stats[Const.Statistic.SkillPoints].currentValue;
      const heroSkills = this._getHeroSkills(hero, entities);
      const addBtns = gui.getAll('SpriteComponent', c => c.id && c.id.startsWith('add_btn_'));

      this._updatePointsHeading(this._skillPointsHeading, skillPoints);

      let i = 0;

      for (const skillGroup of this._getHeroSkillGroups(heroCharClass, entities)) {
        for (const skillRef of skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill')) {
          const skill = EntityFinders.findById(entities, skillRef.entityId);
          const icon = skill.get('InventoryIconComponent');
          const sprite = icon.sprite;

          let isLearned = false;

          if (skill.has('MagicSpellComponent')) {
            const heroMagicSpellSkills = heroSkills.filter(e => e.has('MagicSpellComponent'));

            isLearned = heroMagicSpellSkills.some(
              e => e.get('MagicSpellComponent').magicSpellType === skill.get('MagicSpellComponent').magicSpellType
            );

            if (isLearned) {
              sprite.alpha = 1;
              sprite.filters[0].reset();
              sprite.buttonMode = true;
              sprite.on('click', eventData => this._onSkillClick(eventData));
            } else {
              sprite.alpha = 0.8;
              sprite.filters[0].greyscale(0.5);
              sprite.buttonMode = false;
              sprite.removeAllListeners('click');
            }
          }

          //TODO: check other skills that aren't magic spells

          const learnSprite = addBtns[i].sprite;
          learnSprite.interactive = true;
          learnSprite.buttonMode = true;
          learnSprite.visible = !isLearned && skillPoints > 0;
          learnSprite._skillId = skill.id;
          learnSprite.on('click', eventData => this._onLearnSkillClick(eventData));

          ++i;
        }
      }
    }

    if (this._redrawMemorizedSkill) {
      this._redrawMemorizedSkill = false;

      const heroCharClass = this._getHeroCharacterClass(hero, entities);
      const memory = hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory);

      let done = false;

      for (const skillGroup of this._getHeroSkillGroups(heroCharClass, entities)) {
        for (const skillRef of skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill')) {
          if (skillRef.entityId !== memory.entityId) {
            continue;
          }

          const skill = EntityFinders.findById(entities, skillRef.entityId);
          const icon = skill.get('InventoryIconComponent');
          const sprite = icon.sprite;

          const gui = EntityFinders.findAbilitiesGui(entities);

          const memorizedCursor = gui.get('SpriteComponent', c => c.id === 'memorized_cursor');
          memorizedCursor.sprite.position.x = sprite.position.x - 2;
          memorizedCursor.sprite.position.y = sprite.position.y - 2;
          memorizedCursor.sprite.visible = true;

          done = true;

          break;
        }

        if (done) {
          break;
        }
      }
    }

    if (this._redrawAttributes) {
      this._redrawAttributes = false;

      const attrValueLabels = gui.getAll('TextComponent', c => c.id.startsWith('value_'));
      const attrAddBtns = gui.getAll('SpriteButtonComponent', c => c.id.startsWith('add_attribute_btn_'));
      const attributeStats = Object.keys(Const.Attribute).map(key => Const.Attribute[key]);
      const attrPoints = hero.get('StatisticComponent', c => c.name === Const.Statistic.AttributePoints).currentValue;

      this._updatePointsHeading(this._attributePointsHeading, attrPoints);

      for (const heroAttribute of hero.getAll('StatisticComponent', c => attributeStats.includes(c.name))) {
        const valLabel = attrValueLabels.find(c => c.id.endsWith(heroAttribute.name));
        valLabel.text = heroAttribute.maxValue;

        const addBtn = attrAddBtns.find(c => c.id.endsWith(heroAttribute.name));
        addBtn.visible = attrPoints > 0 && heroAttribute.maxValue < Const.AttributeMax;
      }
    }
  }

  unload(entities) {
    const gui = EntityFinders.findAbilitiesGui(entities);
    for (const c of gui.getAll('SpriteButtonComponent', c => c.id && c.id.startsWith('add_attribute_btn_'))) {
      c.removeAllListeners();
    }

    for (const c of gui.getAll('SpriteComponent', c => c.id && c.id.startsWith('add_btn_'))) {
      c.sprite.removeAllListeners();
    }

    const hero = this._entityManager.heroEntity;
    const heroCharClass = this._getHeroCharacterClass(hero, entities);
    for (const skillGroup of this._getHeroSkillGroups(heroCharClass, entities)) {
      const skillRefs = skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill');
      for (const skillRef of skillRefs) {
        const skill = EntityFinders.findById(entities, skillRef.entityId);
        skill.get('InventoryIconComponent').sprite.removeAllListeners();
      }
    }
  }

  _drawAttributes(headings, gui, entities) {
    const attrNameLabels = gui.getAll('TextComponent', c => c.id.startsWith('label_'));
    const attrValueLabels = gui.getAll('TextComponent', c => c.id.startsWith('value_'));
    const attrAddBtns = gui.getAll('SpriteButtonComponent', c => c.id.startsWith('add_attribute_btn_'));
    const attributeStats = Object.keys(Const.Attribute).map(key => Const.Attribute[key]);
    const hero = this._entityManager.heroEntity;
    const heroAttributes = hero.getAll('StatisticComponent', c => attributeStats.includes(c.name));
    const attrPoints = hero.get('StatisticComponent', c => c.name === Const.Statistic.AttributePoints).currentValue;
    const attributesHeading = headings['attributes'].sprite;
    const xStart = attributesHeading.x + attributesHeading.width / 2;
    let yStart = attributesHeading.y + 25;

    this._updatePointsHeading(this._attributePointsHeading, attrPoints);
    heroAttributes.sort(this._attributeDisplaySortFunc);

    for (const heroAttr of heroAttributes) {
      const nameLabel = attrNameLabels.find(c => c.id.endsWith(heroAttr.name));
      const valLabel = attrValueLabels.find(c => c.id.endsWith(heroAttr.name));
      const addBtn = attrAddBtns.find(c => c.id.endsWith(heroAttr.name));

      this.pixiContainer.addChild(nameLabel.sprite);
      nameLabel.sprite.anchor.set(0.5, 0);
      nameLabel.sprite.position.set(xStart, yStart);

      this.pixiContainer.addChild(valLabel.sprite);
      valLabel.sprite.anchor.set(0.5, 0);
      valLabel.sprite.position.set(xStart, nameLabel.y + nameLabel.height);
      valLabel.text = heroAttr.maxValue;

      addBtn.initialize(this.pixiContainer);
      addBtn.setPosition(xStart + valLabel.width, valLabel.y + Math.ceil((valLabel.height - addBtn.height) / 2));
      addBtn.visible = attrPoints > 0;
      addBtn._attributeName = heroAttr.name;
      addBtn.on('click', eventData => this._onAttributeClick(eventData, addBtn));

      yStart += 30;
    }
  }

  _onAttributeClick(eventData, eventSrc) {
    this.emit('abilities-render-system.increment-attribute', eventSrc._attributeName);

    this._redrawAttributes = true;
  }

  _drawSkills(gui, entities) {
    let startY = 40;
    this._headingGrid = this._createGrid(startY);

    startY += 10;
    this._skillSlotGrid = this._createGrid(startY);

    const hero = this._entityManager.heroEntity;
    const heroCharClass = this._getHeroCharacterClass(hero, entities);
    const stats = hero.getAllKeyed('StatisticComponent', 'name');
    const skillPoints = stats[Const.Statistic.SkillPoints].currentValue;
    const skillGroups = this._getHeroSkillGroups(heroCharClass, entities);
    const heroSkills = this._getHeroSkills(hero, entities);
    const addBtns = gui.getAll('SpriteComponent', c => c.id && c.id.startsWith('add_btn_'));

    this._updatePointsHeading(this._skillPointsHeading, skillPoints);

    const skillGroupMax = skillGroups.length;
    const yMax = this._headingGrid.length;
    const xMax = this._headingGrid[0].length;

    let j = 0;

    for (let y = 0, i = 0; i < skillGroupMax && y < yMax; ++y) {
      for (let x = 0; x < xMax; ++x) {
        i = y * xMax + x;

        if (i >= skillGroupMax) {
          break;
        }

        const skillGroup = skillGroups[i];
        const heading = skillGroup.get('TextComponent');

        this.pixiContainer.addChild(heading.sprite);

        let headingPos = this._headingGrid[y][x];
        heading.sprite.position.x = headingPos.x;
        heading.sprite.position.y = headingPos.y;

        let skillPos = this._skillSlotGrid[y][x];
        let skillPosX = skillPos.x;

        for (const skillRef of skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill')) {
          const skill = EntityFinders.findById(entities, skillRef.entityId);
          const icon = skill.get('InventoryIconComponent');
          const sprite = icon.sprite;
          this.pixiContainer.addChild(sprite);
          sprite.position.x = skillPosX + 2;
          sprite.position.y = skillPos.y + 2;
          sprite.interactive = true;
          sprite._skillId = skill.id;
          sprite
            .on('mouseover', eventData => this._onSkillMouseOver(eventData))
            .on('mouseout', eventData => this._onSkillMouseOut());

          if (!sprite.filters) {
            sprite.filters = [new Pixi.filters.ColorMatrixFilter()];
          }

          let isLearned = false;

          if (skill.has('MagicSpellComponent')) {
            const heroMagicSpellSkills = heroSkills.filter(e => e.has('MagicSpellComponent'));

            isLearned = heroMagicSpellSkills.some(
              e => e.get('MagicSpellComponent').magicSpellType === skill.get('MagicSpellComponent').magicSpellType
            );

            if (isLearned) {
              sprite.alpha = 1;
              sprite.filters[0].reset();
              sprite.buttonMode = true;
              sprite.on('click', eventData => this._onSkillClick(eventData));
            } else {
              sprite.alpha = 0.8;
              sprite.filters[0].greyscale(0.5);
              sprite.buttonMode = false;
              sprite.removeAllListeners('click');
            }
          }

          //TODO: check other skills that aren't magic spells

          const learnSprite = addBtns[j].sprite;
          this.pixiContainer.addChild(learnSprite);
          learnSprite.position.x = sprite.position.x + (sprite.width - learnSprite.width);
          learnSprite.position.y = sprite.position.y + (sprite.height - learnSprite.height);
          learnSprite.interactive = true;
          learnSprite.buttonMode = true;
          learnSprite.visible = !isLearned && skillPoints > 0;
          learnSprite._skillId = skill.id;
          learnSprite.on('click', eventData => this._onLearnSkillClick(eventData));

          ++j;

          skillPosX = skillPos.x + i * 24;
        }
      }
    }

    const memorizedCursor = gui.get('SpriteComponent', c => c.id === 'memorized_cursor');
    this.pixiContainer.addChild(memorizedCursor.sprite);
    memorizedCursor.sprite.visible = false;
  }

  _onLearnSkillClick(eventData) {
    this.emit('abilities-render-system.learn-skill', eventData.target._skillId);

    this._redrawLearnedSkills = true;
  }

  _onSkillMouseOver(eventData) {
    this.emit('abilities-render-system.set-current-skill', eventData.target._skillId);
  }

  _onSkillMouseOut() {
    this.emit('abilities-render-system.set-current-skill', '');
  }

  _onSkillClick(eventData) {
    this.emit('abilities-render-system.set-memorized-skill', eventData.target._skillId);

    this._redrawMemorizedSkill = true;
  }

  _createGrid(startY) {
    let posY = startY;

    const grid = [];

    for (let y = 0; y < 5; ++y) {
      const row = [];
      let posX = 110;

      for (let x = 0; x < 2; ++x) {
        row.push({ x: posX, y: posY });
        posX += 104; // ((20 + 2) * 4) + 16; ((slot size + hspacing) * num of slots) + more spacing;
      }

      grid.push(row);

      posY += 32; // arbitrary. whatever looks good.
    }

    return grid;
  }

  _drawSkillsHeadings(headings) {
    const halfScreenWidth = Const.ScreenWidth / 2;

    const skillsHeading = headings['skills'].sprite;
    this.pixiContainer.addChild(skillsHeading);
    skillsHeading.align = 'center';
    skillsHeading.position.x = (halfScreenWidth - skillsHeading.width * Const.ScreenScale / 2) / Const.ScreenScale;
    skillsHeading.position.y = 15;

    const skillPointsHeading = headings['skill_points'].sprite;
    this.pixiContainer.addChild(skillPointsHeading);
    skillPointsHeading.align = 'center';
    skillPointsHeading.anchor.set(0.5, 0);
    skillPointsHeading.position.x = skillsHeading.x + skillsHeading.width / 2;
    skillPointsHeading.position.y = skillsHeading.y + 8;

    this._skillPointsHeading = skillPointsHeading;
  }

  _drawAttributesHeadings(headings) {
    const attributesHeading = headings['attributes'].sprite;
    this.pixiContainer.addChild(attributesHeading);
    attributesHeading.align = 'center';
    attributesHeading.position.x = 10;
    attributesHeading.position.y = 15;

    const attributePointsHeading = headings['attribute_points'].sprite;
    this.pixiContainer.addChild(attributePointsHeading);
    attributePointsHeading.align = 'center';
    attributePointsHeading.anchor.set(0.5, 0);
    attributePointsHeading.position.x = attributesHeading.x + attributesHeading.width / 2;
    attributePointsHeading.position.y = attributesHeading.y + 8;

    this._attributePointsHeading = attributePointsHeading;
  }

  _drawOtherButtons(otherBtns) {
    const closeBtn = otherBtns['close_btn'];
    closeBtn.initialize(this.pixiContainer);
    closeBtn.setPosition(
      Const.ScreenWidth / Const.ScreenScale - closeBtn.width - 12,
      Const.ScreenHeight / Const.ScreenScale - closeBtn.height - 10
    );
  }

  _updatePointsHeading(heading, points) {
    let msg = '0 points';
    let color = Const.Color.InactiveGray;

    if (points > 0) {
      if (points === 1) {
        msg = '1 point';
      } else {
        msg = `${points} points`;
      }
      color = Const.Color.GoodAlertYellow;
      const glowFilter = new PixiFilters.GlowFilter(8, 2, 1, Const.Color.DarkOrange, 0.5);
      glowFilter.padding += 10;
      heading.filters = [glowFilter];
    } else {
      heading.filters = null;
    }

    heading.tint = color;
    heading.text = msg;
  }

  _getHeroCharacterClass(hero, entities) {
    this._heroCharacterClass =
      this._heroCharacterClass ||
      EntityFinders.findCharacterClasses(entities).find(
        c => c.get('CharacterClassComponent').typeId === hero.get('CharacterClassComponent').typeId
      );

    return this._heroCharacterClass;
  }

  _getHeroSkillGroups(heroCharClass, entities) {
    this._heroSkillGroups =
      this._heroSkillGroups ||
      heroCharClass
        .getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill_group')
        .map(c => EntityFinders.findById(entities, c.entityId));

    return this._heroSkillGroups;
  }

  _getHeroSkills(hero, entities) {
    return hero
      .getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill')
      .map(c => EntityFinders.findById(entities, c.entityId));
  }
}
