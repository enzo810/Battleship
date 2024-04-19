/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);
            setTimeout(function () {
                self.game.fire(this, x, y, function (hasSucced) {
                    var miniGrid = document.querySelector(".mini-grid");
                    var node = miniGrid.querySelector('.row:nth-child(' + (y + 1) + ') .cell:nth-child(' + (x + 1) + ')');
                    self.tries[x][y] = hasSucced;
                    switch(hasSucced) {
                      case "touché":
                        node.classList.add('touchShip'); // Ajoute la classe pour déclencher l'animation
                        break;
                      case "déja touché":
                        node.style.backgroundColor = '#FFA500';
                        break;
                      case "déja manqué":
                        node.style.backgroundColor = '#FFFFFF';
                        break;
                      default:
                        node.classList.add('missShip');
                        node.style.backgroundColor = '#FFFFFF';
                    }
                });
            }, 1000);
        },
        isShipOk: function (callback) {
            let j;
            let arr = [0, 1, 2, 3, 4, 5, 6, 7 ,8, 9];
            let newArr = utils.shuffle(arr);

            this.fleet.forEach(function (ship, i) {
                i = newArr.pop();
                let j = utils.getRandomNumber(0, 9);
                let p = utils.getRandomNumber(0, j);

                while (p + ship["life"] > 9) {
                  p = utils.getRandomNumber(0, j);
                }

                let k = 0
                  while (k < ship["life"]) {
                      this.grid[i][p + k] = ship.getId();
                      k += 1;
                  }

            }, this);

            setTimeout(function () {
                callback();
            }, 500);
        },

        setGame: function (game) {
          this.game = game;
        }

    });

    global.computer = computer;

}(this));
