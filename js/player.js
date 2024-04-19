/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var ship = {dom: {parentNode: {removeChild: function () {}}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        vertical: false,
        points: 0,

        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;
            if (this.grid[line][col] != 0 && Number.isInteger(this.grid[line][col])) {
                succeed = "touché";
                this.grid[line][col] = succeed;
            } else if (this.grid[line][col] == "touché"){
                succeed = "déja touché";
            } else if (Number.isInteger(this.grid[line][col])) {
              succeed = "manqué";
              this.grid[line][col] = succeed;
            } else {
                succeed = "déja manqué";
            }

            let findOne = 0;
            let findTwo = 0;
            let findThree = 0;
            let findFour = 0;
            let check = 0;


            for (let w = 0; w < 10; w++) {
              for (let z = 0; z < 10; z++) {
                if (this.grid[w][z] == 1) {
                  findOne += 1;
                }
                if (this.grid[w][z] == 2) {
                  findTwo += 1;
                }
                if (this.grid[w][z] == 3) {
                  findThree += 1;
                }
                if (this.grid[w][z] == 4) {
                  findFour += 1;
                }
              }
            }

            if (this.game.currentPhase == "PHASE_PLAY_OPPONENT") {

              if (this.checkShipLife(1) == false){
                let one = document.querySelector(".battleship");
                one.classList.add("sunk");
              }
              if (findTwo == 0){
                let two = document.querySelector(".destroyer");
                two.classList.add("sunk");
              }
              if (findThree == 0){
                let three = document.querySelector(".submarine");
                three.classList.add("sunk");
              }
              if (findFour == 0){
                let four = document.querySelector(".small-ship");
                four.classList.add("sunk");
              }
            }

            callback.call(undefined, succeed);
        },

        checkShipLife: function (size) {
          for (let w = 0; w < 10; w++) {
            for (let z = 0; z < 10; z++) {
              if (this.grid[w][z] == size)
                return true;
            }
          }
          return false;
        },

        setActiveShipPosition: function (x, y) {
            var ship = this.fleet[this.activeShip];
            var i = 0;

            if(this.vertical == false){
                if ( x + (ship["life"]) > 10 ) {
                    return false;
                }else if (this.grid[y][x] != 0){
                    return false;
                }else if(this.grid[y][x + ship["life"] - 1] != 0) {
                    return false;
                }
                else{
                    while (i < ship.getLife()) {
                        this.grid[y][x + i] = ship.getId();
                        i += 1;
                    }
                }
                return true;
            } else {
                for (let u = 0; u < ship.getLife(); u++) {
                  if (this.grid[y + u][x] != 0) {
                    return false;
                  }
                }
                if ( y + (ship["life"]) > 10 ) {
                    return false;
                }else if (this.grid[y][x] != 0){
                    return false;
                }else{
                    while (i < ship.getLife()) {
                        this.grid[y + i][x] = ship.getId();
                        i += 1;
                    }
                }
                return true;
            }
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
          let current = this.game.currentPhase;
          console.log(current);
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');

                    if (val === "touché") {
                        node.classList.add('touchShip');
                        // node.style.backgroundColor = "FF0000";
                    } else if (val === "manqué") {
                        node.classList.add('missShip');
                        node.style.backgroundColor = '#FFFFFF';
                    }
                });
            });
        },
        renderShips: function (grid) {
        },
        setGame: function (game) {
          this.game = game;
        },
        isShipOk: function () {

        }
    };

    global.player = player;

}(this));
