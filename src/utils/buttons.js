
/**
 * Registers pointerover event for a game object
 * @param {GameObject} [gameObjet]
 */
function pointerOver (gameObjet){
    gameObjet.on('pointerover', function () {
        this.setTint(0xff0000);
    });
}

/**
 * Registers pointerout event for a game object
 * @param {GameObject} [gameObjet]
 */
function pointerOut (gameObjet){
    gameObjet.on('pointerout', function () {
        this.clearTint();
    });
}

export {
    pointerOver,
    pointerOut
}