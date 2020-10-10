const util = require('util');
const randomInt = require('random-int')

function multiplayer(io) {

    /**
    * Player Status
    * 
    *- connected
    *- joinedToRoom
    *- waiting
    *- playing
    *- disconnected
    */

    /**
    * Room Status
    *    
    *- available 
    *- waiting
    *- playing     
    */

    // multiplayer

    // constants
    const timeMaxMatches = 180000; // 3 min
    const countdownLobby = 3000; //
    const delayMS = 1000;

    // players connected
    let playersList = [];

    // buffer
    let rooms = [];
    rooms[0] = {
        name: "0",
        status: "available",
        activateCountdown: false,
        sceneCountdown: "",
        countdown: 0,
        slugNameGame: "",
        players: [],
        items: {
            maxCoins: 72,
            coins: [],
            bombs: []
        }
    };

    // global timer
    setInterval(loop, delayMS);
    function loop() {
        rooms.forEach(room => {
            if (room.activateCountdown)
                room.countdown -= delayMS;
            if (room.countdown <= 0 && room.status === "waiting") {
                room.countdown = -1;
                room.status = "playing";
                room.activateCountdown = false;
                room.items = {
                    maxCoins: 72,
                    coins: [],
                    bombs: []
                }
                room.sceneCountdown = "match";
                room.setupGameObjects();
            }
        });
    }

    // reset a room
    function resetRoom(room) {
        room.status = "available";
        room.activateCountdown = false;
        room.sceneCountdown = "";
        room.countdown = 0;
        room.players = [];
        items = {
            maxCoins: 72,
            coins: [],
            bombs: []
        }
    }

    // socket events
    io.on('connection', socket => {
        console.log("hello ", socket.id);

        socket.on('newPlayer', (obj) => {
            console.log(obj);
            if (obj && obj.playerName) {
                let player = {
                    name: obj.playerName,
                    socketId: socket.id,
                    urlProfilePhoto: null,
                    room: null,
                    game: obj.slugNameGame,
                    status: "connected",
                    items: []
                };

                playersList.push(player);
                console.log("length c " + playersList.length);
                socket.broadcast.emit('playerConnectedClient', player.name);
            }
        });

        socket.on('setPlayerStatus', (item) => {
            let player = playersList.find(v => v.name === item.playerName);
            player.status = item.status;
        });

        socket.on('getPlayer', (item) => {
            let player = playersList.find(v => v.name === item.playerName);
            socket.emit('currentPlayerClient', player);
        });

        socket.on('getRoom', (item) => {
            let room = rooms.find(v => v.name === item.roomName);
            if (room.status === "playing" && !room.activateCountdown) {
                room.activateCountdown = true;
                room.countdown = timeMaxMatches;
            }
            socket.emit('currentRoomClient', room);
        });

        socket.on('getPlayersRoom', (item) => {
            let playersListByRoom = playersList.filter(v => v.room == item.roomName);
            let obj = {
                playersList: playersListByRoom,
                roomName: item.roomName
            }
            io.emit('currentPlayersClient', obj);
        });

        socket.on('joinedRoom', (item) => {
            let player = playersList.find(v => v.name === item.playerName);
            if (player) {
                player.room = item.roomName;
                player.status = "joinedToRoom";
                let room = rooms.find(v => v.name == item.roomName);
                let playerInRoom = room.players.find(v => v.name == item.playerName);
                if (playerInRoom != player)
                    room.players.push(player);
                let playersListByRoom = playersList.filter(v => v.room == item.roomName);
                let obj = {
                    playersList: playersListByRoom,
                    roomName: item.roomName,
                    player: player
                }
                // console.log("check");
                // console.log(rooms);
                io.emit("currentPlayersClient", obj);
            }
        });

        socket.on('quitRoom', (item) => {
            if (item.roomName) {
                let player = playersList.find(v => v.name === item.playerName);
                if (player) {
                    player.status = "connected";
                    player.room = "";
                    let room = rooms.find(v => v.name == item.roomName);

                    let index = room.players.findIndex(v => v.name === item.playerName);
                    room.players.splice(index, 1);

                    let obj = {
                        playersList: room.players,
                        roomName: item.roomName,
                        player: player
                    }

                    io.emit('currentPlayersClient', obj);
                }
            }
        });

        socket.on('setCountdown', (item) => {
            let room = rooms.find(v => v.name == item.roomName);
            if (!room.activateCountdown) {
                room.activateCountdown = true;
                room.sceneCountdown = "lobby";
                room.status = "waiting";
                room.countdown = countdownLobby;
                room.setupGameObjects = () => {
                    let room = rooms.find(v => v.name == item.roomName);
                    for (let i = 0; i < room.items.maxCoins; i++) {
                        room.items.coins.push({
                            name: 'c' + i,
                            x: i < 18 ? 160 + (i * 64) : 0,
                            y: 200,
                            isVisible: i < 18 ? true : false, // it will improve
                            owner: null
                        });
                    }
                    io.emit('startGameClient', room.players);
                }
            }
        });

        socket.on('getCountdown', (item) => {
            let room = rooms.find(v => v.name == item.roomName);
            let obj = {
                countdown: room.countdown,
                sceneCountdown: room.sceneCountdown,
                status: room.status
            };

            io.emit('getCountdownClient', obj);
        });

        socket.on('quitLobby', (item) => {
            if (item.roomName) {
                let player = playersList.find(v => v.name === item.playerName);
                player.status = "connected";
                player.room = "";
                let room = rooms.find(v => v.name == item.roomName);

                // console.log(util.inspect(room.players));
                let index = room.players.findIndex(v => v.name === item.playerName);
                room.players.splice(index, 1);

                let _playersList = room.players.filter(v => v.status == "waiting");

                let obj = {
                    playersList: _playersList,
                    roomName: item.roomName
                }
                // console.log(util.inspect(room));
                io.emit('currentPlayersClient', obj);
            }
        });

        // playing
        socket.on('setPlayerPosScene', (item) => {
            let room = rooms.find(v => v.name == item.roomName);
            let obj = {
                player: item,
                countdown: room.countdown
            };
            io.emit('newPlayerPosScene', obj);
        });

        socket.on('renderGameObjects', (item) => {
            let result = null;
            let room = rooms.find(v => v.name == item.roomName);
            if (item.action === "collectCoin") {
                let coin = room.items.coins.find(v => v.name == item.coinName);
                if (coin && !coin.owner) {
                    coin.owner = item.playerName;
                    let playerInRoom = room.players.find(v => v.name == item.playerName);
                    if (playerInRoom) {
                        // console.log(playerInRoom);
                        console.log(playerInRoom.items.coins);
                        playerInRoom.items.coins = Number.isInteger(playerInRoom.items.coins) ? playerInRoom.items.coins + 1 : 1;
                        console.log(playerInRoom.items.coins);
                        coin.isVisible = false;
                        result = {
                            coin: coin,
                            update: true,
                            playerName: item.playerName,
                            playerCoins: playerInRoom.items.coins,
                            action: "collectCoin"
                        };
                    }
                }
            } else if (item.action === "createCoins") {
                let i = 0;
                room.items.coins.forEach((coin) => {
                    if (!coin.owner && i < 18/* it will change*/) {
                        coin.isVisible = true;
                        coin.x = 160 + (i * 64);
                        coin.y = 200;
                        i++;
                    }
                });
                result = {
                    update: false,
                    coins: room.items.coins
                }
            } else if (item.action === "createBoom") {
                result = {
                    posX: randomInt(128, item.boundsSceneX - 128),
                    velocityX: randomInt(randomInt(-200, -100), randomInt(100, 200)),
                    action: "createBoom",
                    update: true,
                }
            } else if (item.action === "playerShot") {
                result = item;
                result.update = true;
            } else if (item.action === "hitPlayer") {
                let coins = room.items.coins.filter(v => v.owner === item.playerName);
                let coin = null;
                let playerCoins = -1;
                if (coins) {
                    coin = coins.length > 0 ? coins[0] : null;
                    if (coin) {
                        coin.isVisible = true;
                        coin.owner = null;
                        let playerInRoom = room.players.find(v => v.name == item.playerName);
                        if (playerInRoom) {
                            playerInRoom.items.coins -= 1;
                            playerCoins = playerInRoom.items.coins;
                        }
                    }
                }
                result = item;
                result.coin = coin;
                result.update = true;
                result.playerCoins = playerCoins;
            }


            // let test = "";
            // room.items.coins.forEach((coin) => {
            //     if (coin.owner)
            //         test += coin.visible + "-" + coin.owner + ",";
            // });
            // console.log(test);

            io.emit('renderGameObjectsClient', result);
        });
        // playing

        socket.on('leaveGame', (data) => {

            const player = playersList.find(v => v.playerName === data.userName);

            if (player) {
                let room = rooms.find(v => v.name == player.room);
                if (room) {
                    let playerInRoomIndex = room.players.findIndex(v => v.playerName === player.playerName);

                    room.players.splice(playerInRoomIndex, 1);

                    if (room.players.length <= 0)
                        resetRoom(room);
                }
                player.status = "connected";
            }
            console.log("leave game " + player.status);
        });

        socket.on('disconnect', function () {
            // console.log(socket.id + ' disconnected');            
            let playerIndex = playersList.findIndex(v => v.socketId === socket.id);
            let playerName = null;

            if (playerIndex >= 0) {
                let room = rooms.find(v => v.name == playersList[playerIndex].room);
                if (room) {
                    let playerInRoomIndex = room.players.findIndex(v => v.socketId === socket.id);

                    room.players.splice(playerInRoomIndex, 1);

                    if (room.players.length <= 0)
                        resetRoom(room);
                }
                playerName = playersList[playerIndex].name;
                playersList.splice(playerIndex, 1);
            }

            // console.log("check2");
            // console.log(room);
            // console.log(playersList);
            // delete playersList[socket.id];
            // delete rooms[0]["room1"][socket.id];
            // emit a message to all players to remove this player
            console.log("length d " + playersList.length);
            io.emit('playerDisconnectedClient', playerName);
        });
    });
};

module.exports = {
    multiplayer
};