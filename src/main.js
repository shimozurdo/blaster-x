import Title from "./scenes/title.js"
// import MatchSettings from "./scenes/match.settings"
import Help from "./scenes/help.js"
// import Lobby from "./scenes/lobby";
// import Match from "./scenes/match";
import Preload from './scenes/preload.js'
import { CONSTANT } from "./constant.js";

const config = {
    title: "Blaster x",
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 }
        }
    },
    dom: {
        createContainer: true
    },
    scene: [Preload, Title, Help]
};

const socketIo = io(CONSTANT.SOCKET_URL, { query: "player=guest" });
config.socket = socketIo;
new Phaser.Game(config);
