// GameBoard code below
var graphCtx = null;
var saveLoadCounter = 15;
var params = {
}
// the "main" code begins here
var Manager;
var ASSET_MANAGER = new AssetManager();
var gameEngine = new GameEngine();

	ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
	var socket = null;
	if (window.io !== undefined) {
		console.log("Database connected!");
		socket = io.connect('http://24.16.255.56:8888');
	}

	ASSET_MANAGER.downloadAll(function () {
		getSettings();
		console.log("starting up da sheild");
		var canvas = document.getElementById('gameWorld');
		var ctx = canvas.getContext('2d');
		gameEngine.init(ctx);
		
		Manager = new ExpManager(gameEngine);
		gameEngine.addEntity(Manager);
		gameEngine.board = Manager.automata;
		
		
		//var automata = new Automata(gameEngine);
		//gameEngine.addEntity(automata);
		//gameEngine.board = automata;
		gameEngine.start();
	});
function initiliaze_game(){
	getSettings();
	gameEngine.entities = [];
	var automata2 = new ExpManager(gameEngine);
	gameEngine.addEntity(automata2);
	gameEngine.board = automata2.automata;
};

function loadGame(){
	socket.emit("load", {studentname: "Gobindroop Mann", statename: saveLoadCounter});
	socket.on("load", function (e) {
		console.log("got info from database");
		for (var i = 0; i < 100; i++) {
			for (var j = 0; j < 100; j++) {
				var cell = e.board[i][j];
				cell.game = gameEngine;
				cell.update = function () {
					var growthRate = params.cellGrowthRate;
					var decayRate = params.cellDecayRate;
					if (this.color !== "Black" && this.color !== "White" && (Math.random() < growthRate)) {
						var newX = (this.x + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;
						var newY = (this.y + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;

						if (this.game.board.board[newX][newY].color === "Black") {
							var newCell = this.game.board.board[newX][newY];
							var bit = randomInt(2);
							newCell.genome = this.genome + Math.pow(-1, bit) * Math.random() * params.cellOffspringVolatility;
							if (newCell.genome < 0) newCell.genome = newCell.genome + 1;
							if (newCell.genome > 1) newCell.genome = newCell.genome - 1;
							newCell.color = hsl(Math.floor(360 * newCell.genome), 100, 50);

						}			
					}
					if (this.color !== "Black" && Math.random() < decayRate) this.color = "Black";
				}
			}
		}
		
		for (var i = 0; i<e.agents.length; i++) {
			e.agents[i].game = gameEngine;
			e.agents[i].update = function () {
				var cell = this.game.board.board[this.x][this.y];
				if (cell.color === "White") {
					if (Math.random() < params.reproductionChance) {
						var agent = new Agent(this.game, this.x, this.y, this);
						//console.log("Old genome:" + this.genomeFood + " New genome:" + agent.genomeFood);
						this.game.board.agents.push(agent);
					}
					cell.color = "Black";
				} else if (cell.color === "Black") {
					// safe
				} else {
					//Landed in a colored square
					var dist = distance(Math.floor(360 * this.genomeFood), Math.floor(360 * cell.genome));//Calculate distance
					var dist2 = distance(Math.floor(360 * this.genomePoison), Math.floor(360 * cell.genome));
					
					if((Math.random() * params.healPoisonRange * 180) > dist2){
						this.hits--;
						cell.color = "Black";
					}
					if((Math.random() * params.healPoisonRange * 180) > dist) {
						if (this.hits < this.maxHits && params.healingToggle) this.hits++;
						cell.color = "White";
					}
					if(cell.color !== "White") {
						cell.color = "Black";
					}
					
				}

				// did I die?
				if (this.hits < 1 || Math.random() < params.deathChanceAgent) {
					this.dead = true;
				}

				// move
				if (!this.dead) {
					
					if (params.brainPower) {
						var topLeftX = (this.x - 1 + this.game.board.dimension) % this.game.board.dimension;
						var topX = (this.x + this.game.board.dimension) % this.game.board.dimension;
						var topRightX = (this.x + 1 + this.game.board.dimension) % this.game.board.dimension;
						var leftX = (this.x - 1 + this.game.board.dimension) % this.game.board.dimension;
						var rightX = (this.x + 1 + this.game.board.dimension) % this.game.board.dimension;
						var botLeftX = (this.x - 1 + this.game.board.dimension) % this.game.board.dimension;
						var botX = (this.x + this.game.board.dimension) % this.game.board.dimension;
						var botRightX = (this.x + 1 + this.game.board.dimension) % this.game.board.dimension;

						var topLeftY = (this.y + 1 + this.game.board.dimension) % this.game.board.dimension;
						var topY = (this.y + 1 + this.game.board.dimension) % this.game.board.dimension;
						var topRightY = (this.y + 1 + this.game.board.dimension) % this.game.board.dimension;
						var leftY = (this.y + this.game.board.dimension) % this.game.board.dimension;
						var rightY = (this.y + this.game.board.dimension) % this.game.board.dimension;
						var botLeftY = (this.y - 1 + this.game.board.dimension) % this.game.board.dimension;
						var botY = (this.y - 1 + this.game.board.dimension) % this.game.board.dimension;
						var botRightY = (this.y - 1 + this.game.board.dimension) % this.game.board.dimension;

						var topLeftCell = this.game.board.board[topLeftX][topLeftY];
						var topCell = this.game.board.board[topX][topY];
						var topRightCell = this.game.board.board[topRightX][topRightY];
						var leftCell = this.game.board.board[leftX][leftY];
						var rightCell = this.game.board.board[rightX][rightY];
						var botLeftCell = this.game.board.board[botLeftX][botLeftY];
						var botCell = this.game.board.board[botX][botY];
						var botRightCell = this.game.board.board[botRightX][botRightY];
						var neighs = [topLeftCell, topCell, topRightCell, leftCell, rightCell, botLeftCell, botCell, botRightCell];
						var probs = [];
						for (var i = 0; i < neighs.length; i++) {
							var cellInQuestion = neighs[i];
							if (cellInQuestion.color === "Black") {
								probs.push(10);
							}
							else if (cellInQuestion.color === "White") {
								probs.push(180);
							}
							else {
								var attrDist = distance(Math.floor(360 * this.genomeAttract), Math.floor(360 * cellInQuestion.genome)); // attract distance 0-180
								var avoidDist = distance(Math.floor(360 * this.genomeAvoid), Math.floor(360 * cellInQuestion.genome));  // avoid distance 0-180
								var attrValue = 0;
								var avoidValue = 0;
								if((Math.random() * params.attrAvoidRange) > attrDist) {
									attrValue = (params.attrAvoidRange - attrDist); //put attract score 0-180
								}
								if((Math.random() * params.attrAvoidRange) > avoidDist){
									avoidValue = (params.attrAvoidRange - avoidDist); //put avoid score 0-180
								}
								var totalValue = (attrValue - avoidValue) * 10;
								if(attrValue == 0 && avoidValue == 0){ //if you miss the attract and avoid genomes you get a base score of 10
									totalValue = 10;
								}
								if(totalValue < 0){
									totalValue = 0;
								}
								
								probs.push(totalValue);
							}
						}
						var sum = probs.reduce((a, b) => a + b);
						for (var i = 0; i < probs.length; i++) {
							probs[i] = probs[i] / sum;
						}
						for (var i = 1; i < probs.length; i++) {
							probs[i] = probs[i] + probs[i - 1];
						}
						var test = Math.random();
						if (test < probs[0]) {
							this.x = topLeftX;
							this.y = topLeftY;
						}
						else if (test < probs[1]) {
							this.x = topX;
							this.y = topY;
						}
						else if (test < probs[2]) {
							this.x = topRightX;
							this.y = topRightY;
						}
						else if (test < probs[3]) {
							this.x = leftX;
							this.y = leftY;
						}
						else if (test < probs[4]) {
							this.x = rightX;
							this.y = rightY;
						}
						else if (test < probs[5]) {
							this.x = botLeftX;
							this.y = botLeftY;
						}
						else if (test < probs[6]) {
							this.x = botX;
							this.y = botY;
						}
						else {
							this.x = botRightX;
							this.y = botRightY;
						}
					}
					else {
						var newX = (this.x + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;
						var newY = (this.y + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;
						var newCell = this.game.board.board[newX][newY];
						this.x = newX;
						this.y = newY;
					}
				   
				}
			}
		}
		var Manag = new ExpManager(gameEngine, true);
		Manag.automata = new Automata(gameEngine);
		Manag.automata.board = e.board;
		Manag.automata.agents = e.agents;
		e.params.waitTurns = 0;
		params = e.params;
		gameEngine.entities = [];
		gameEngine.addEntity(Manag);
		gameEngine.board = Manag.automata;
	});
}
function saveGame(){
	saveLoadCounter++;
	for (var i = 0; i < 100; i++) {
        for (var j = 0; j < 100; j++) {
            var cell = Manager.automata.board[i][j];
			cell.game = null;
        }
    }
	for (var i = 0; i<Manager.automata.agents.length; i++) {
		Manager.automata.agents[i].game = null;
	}
	var data = {studentname : "Gobindroop Mann",
				statename: saveLoadCounter,
				board: Manager.automata.board,
				agents:Manager.automata.agents,
				params: params
				}
	if (socket) {
		socket.emit("save", data);
		console.log("sent to database");
	}
	for (var i = 0; i < 100; i++) {
        for (var j = 0; j < 100; j++) {
            var cell = Manager.automata.board[i][j];
			cell.game = gameEngine;
        }
    }
	for (var i = 0; i<Manager.automata.agents.length; i++) {
		Manager.automata.agents[i].game = gameEngine;
	}
}