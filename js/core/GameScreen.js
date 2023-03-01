import { CANVAS_SETTINGS, BUTTON_TYPES } from '../constants/constants.js';
import { calculateCoordsToCenterItem } from '../utils/utils.js';
import { TEXT_LABELS } from '../constants/strings.js';
import { ScreenLayoutManager } from './ScreenLayoutManager.js';
import { BrickBreakerScreen } from './BrickBreakerScreen.js';

export class GameScreen {
  
  constructor(options, p5) {
    this.p5 = p5;

    this.layoutManager = new ScreenLayoutManager();
    this.layoutManager.calculateLayout();

    // Simular que se presionan las flechas del teclado cuando
    // se presionan los botones en pantalla
    this.layoutManager.getButtons().forEach(btn => {
      const simulatedInput = btn.type === BUTTON_TYPES.LEFT ? this.p5.LEFT_ARROW : this.p5.RIGHT_ARROW;
      btn.setOnClick(() => this.handleKeyPressed(simulatedInput));
      btn.setOnClickRelease(() => this.handleKeyReleased());
    });

    this.canvasHeight = this.layoutManager.getWindowHeight();
    this.canvasWidth = this.layoutManager.getWindowWidth();

    this.gameAreaData = this.layoutManager.getGameScreenData();

    // La coordenada (y) a partir de la cual empieza el area de juego
    this.CANVAS_GAME_AREA_Y = Math.floor(this.canvasHeight * options.SCORE_DISPLAY_HEIGHT);

    this.canvas = p5.createCanvas(this.canvasWidth, this.canvasHeight);

    this.canvasX = 0;
    this.canvasY = 0;
  
    this.canvas.position(this.canvasX, this.canvasY);

    this.isOnMenu = true;

    this.playBtn = null;
    this.generateMenu();

    const { width, x, y } = this.gameAreaData
    this.brickBreakerScreen = new BrickBreakerScreen({
      p5: this.p5,
      width,
      x,
      y,
      layoutManager: this.layoutManager,
    });
  }

  draw() {
    if (this.isOnMenu) {
      this.drawMenu();
    } else {
      this.brickBreakerScreen.draw();
      this.drawButtons();
    }
  }

  drawMenu() {
    this.p5.push();
    this.p5.background(0, 0, 0);
    this.p5.fill(254, 254, 254);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.textSize(this.canvasWidth * 0.07);
    this.p5.text(TEXT_LABELS.GAME_TITLE, this.canvasWidth / 2, this.CANVAS_GAME_AREA_Y * 4);
    this.p5.pop();
  }

  drawButtons() {
    this.p5.push();
    this.p5.fill(60, 60, 60);
    this.layoutManager.getButtons().forEach(btn => {
      this.p5.rect(btn.x, btn.y, btn.width, btn.height);
    });
    this.p5.pop();
  }

  generateMenu() {
    const btnWidth = this.canvasWidth * CANVAS_SETTINGS.BTN_WIDTH;
    const btnHeight = (btnWidth * CANVAS_SETTINGS.BTN_ASPECT_RATIO_V) / CANVAS_SETTINGS.BTN_ASPECT_RATIO_H;
  
    const { x, y } = calculateCoordsToCenterItem({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      objectHeight: btnHeight,
      objectWidth: btnWidth,
    });

    this.playBtn = this.p5.createButton(TEXT_LABELS.PLAY_BTN);
    this.playBtn.position(x, y + btnHeight);
    this.playBtn.size(btnWidth, btnHeight);
    this.playBtn.mouseClicked(this.onBtnPlayClick.bind(this));
  }

  onBtnPlayClick() {
    this.isOnMenu = false;
    this.playBtn.remove();
  }

  handleKeyPressed(key) {
    const input = key ? key : this.p5.keyCode;
    if (this.p5.keyIsPressed || this.p5.mouseIsPressed) {
      this.brickBreakerScreen.handleKeyPressed(input);
    }
  }

  handleKeyReleased() {
    this.brickBreakerScreen.handleKeyReleased();
  }

  handleTouchStarted() {
    if (this.isOnMenu) return;
    const mouseX = this.p5.mouseX;
    const mouseY = this.p5.mouseY;

    this.layoutManager.getButtons().forEach(btn => btn.click({ mouseX, mouseY }));
    this.brickBreakerScreen.handleTouchStarted({ mouseX, mouseY });
  }

  handleTouchReleased() {
    this.layoutManager.getButtons().forEach(btn => btn.clickReleased());
    this.brickBreakerScreen.handleTouchReleased();
  }

}