import * as Phaser from "phaser";

// React owns the visible HUD. This empty scene is kept as a clear extension
// point for future Phaser-only UI effects without mixing responsibilities.
export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }
}
