/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');

            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            this.playerTurnPhaseIndex = 0;

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            // console.log(this.phaseOrder)
            // console.log(this.currentPhase)
            var self = this;

            // console.log(this.phaseOrder.indexOf(this.currentPhase))
            if (ci !== this.phaseOrder.length - 2) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[2];
            }

            switch (this.currentPhase) {
            case this.PHASE_GAME_OVER:
                // detection de la fin de partie
                if (!this.gameIsOver()) {
                    console.log(this.currentPhase);
                    this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                }

            case this.PHASE_INIT_PLAYER:
                utils.info("Placez vos bateaux");
                // console.log(this.currentPhase);
                break;
            case this.PHASE_INIT_OPPONENT:
                this.wait();
                utils.info("En attente de votre adversaire");
                    this.players[1].isShipOk(function () {
                        self.stopWaiting();
                        self.wait();
                        utils.info("Choisissez le premier joueur attaquant.")
                        self.handleFirstPlayer();
                // console.log(this.handleFirstPlayer())
                });
                break;
            case this.PHASE_PLAY_PLAYER:
                utils.info("A vous de jouer, choisissez une case !");
                break;
            case this.PHASE_PLAY_OPPONENT:
                utils.info("A votre adversaire de jouer...");
                this.players[1].play();
                break;
            }
        },
        gameIsOver: function () {
          console.log(self);
            return false;
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener("contextmenu", _.bind(this.handleRight, this));
        },
        handleRight: function (e) {
            if(this.getPhase() === this.PHASE_INIT_PLAYER){
                e.preventDefault();
                if(this.players[0].vertical == false){
                    this.players[0].vertical = true;
                    console.log(this.players[0].vertical);
                } else {
                    this.players[0].vertical = false;
                    console.log(this.players[0].vertical);
                }

            }
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                if (this.players[0].vertical == false) {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / ship.getLife() - 1) * utils.CELL_SIZE + "px";
                    ship.dom.style.transform = "none";
                }else{
                    if(ship.id == 1 || ship.id == 2 || ship.id == 4){
                        ship.dom.style.transform = "rotate(90deg)";
                        ship.dom.style.top = "" + (utils.eq(e.target.parentNode) + Math.floor(ship.getLife() / 2)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) +  "px";
                        ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE  + "px";
                    } else if (ship.id == 3){
                        ship.dom.style.transform = "rotate(90deg)";
                        ship.dom.style.top = "" + (utils.eq(e.target.parentNode) + Math.floor(ship.getLife() / 2 - 1)) * utils.CELL_SIZE - (570 + this.players[0].activeShip * 60) +  "px";
                        ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / ship.getLife() + 3 ) * utils.CELL_SIZE + 150 + "px";
                    }
                }
            }
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                    this.players[0].renderTries(this.grid);

                //    if (this.players[0].play() = 0 ) {
                //         utils.info("Vous ne pouvez pas jouer deux fois sur la même case.");
                //     }
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }

            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed) {
                if(hasSucceed === "touché"){
                    msg += "Touché !";
                    target.points += 1;
                        if(target.points == 17){
                        game.currentPhase = game.PHASE_GAME_OVER;
                            if(game.currentPhase == "THIS_PHASE_PLAYER"){
                                alert("Vous avez perdu...");
                            } else {
                                alert("Vous avez gagné !");
                                self.wait()
                                utils.confirm('Voulez-vous recommencez ?', function() {
                                    self.stopWaiting();
                                    window.location.reload();
                                })
                        }
                        }
                } else if (hasSucceed === "déja touché"){
                    msg += "Touché ! La même case...";
                } else if (hasSucceed === "manqué"){
                    msg += "Manqué...";
                } else {
                    msg += "Manqué... La même case...";
                }
                // console.log(target.tries)

                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed);

                if (hasSucceed == "touché") {
                  var audio = new Audio('./son/explosion.mp3');
                  audio.play();
                }else if (hasSucceed == "déja touché"){
                  var audio = new Audio('./son/explosion.mp3');
                  audio.play();
                }else if (hasSucceed == "déja manqué"){
                  var audio = new Audio('./son/eau.wav');
                  audio.play();
                }else {
                  var audio = new Audio('./son/eau.wav');
                  audio.play();
                }
                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
                
            });
        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
          for(let line = 0; line < 10; line++){
            for(let col = 0; col < 10; col++){
              if (this.players[0].grid[line][col] != 0) {
                this.miniGrid.children[line].children[col].style.background = this.players[0]["fleet"][this.players[0].grid[line][col] - 1].color;
              }
            }
          }
        },

        handleFirstPlayer: function() {
            var self = this;
            var form = document.getElementById('firstPlayerForm');
            self.wait();
            utils.confirm('Êtes-vous sûr de votre choix?', function() {
                self.stopWaiting();
                var firstPlayer = form.elements['firstPlayer'].value;
                // console.log(firstPlayer)
                // console.log(form.elements['firstPlayer'].value)
                if (!firstPlayer) {
                    alert('Veuillez choisir le premier joueur');
                    return;
                }
                if(firstPlayer === 'Joueur') {
                        var firstPlayer = form.elements['firstPlayer'].value;
                        self.currentPhase = self.PHASE_PLAY_OPPONENT;
                        console.log(firstPlayer)

                    } else if(firstPlayer === 'Ordinateur') {
                        self.currentPhase = self.PHASE_PLAY_PLAYER;
                        console.log(firstPlayer)

                    } else if(firstPlayer === 'Aléatoire') {
                        var random = Math.random();
                        if(random < 0.5) {
                            self.currentPhase = self.PHASE_PLAY_OPPONENT;
                        } else {
                            self.currentPhase = self.PHASE_PLAY_PLAYER;
                        }
                    }else {
                        throw new Error('Erreur: Joueur invalide ' + firstPlayer);
                    }
                self.goNextPhase();
            });
        },
    }

    
    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });
    
}());
