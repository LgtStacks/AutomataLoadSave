function Automata(game, title) {
	this.firstDeath = true;
	this.updateCounter = 0;
    this.game = game;
    this.x = 0;
    this.y = 0;
	this.title = title;
    this.dimension = 100;
    this.populationSize = params.spawningPopulation;
    this.agents = [];


	 // data gathering
	this.cellAgentFoodDiff = [];
	this.poisonAvoidDiff = [];
	this.foodAttractDiff = [];
    this.weightData = [];
	this.healPoiData = [];
	
	this.poisonData = [];
	this.attractData = [];
	this.avoidData = [];

	this.cellData = [];
	
	this.colorCircData = [];
	this.whitePop = [];
    this.totalPopCell = [];
	this.standardDeviation = [];
	this.totalPopAgent = [];
	this.standardDeviationAgent = [];
    // graphs
	
	
    this.popGraph = new Graph(game, 1210, 200, this, "Cell Population/Std Dev");
    //this.game.addEntity(this.popGraph);
	
	this.popGraph = new Graph2(game, 1610, 200, this, "Agent Population/Std Dev");
    //this.game.addEntity(this.popGraph);

    this.weightHist = new Histogram(game, 810, 0, "Food Genome Dist.")
    this.game.addEntity(this.weightHist);
	
	
	
	this.poisonHist = new Histogram(game, 810, 200, "Poison Genome Dist.")
    this.game.addEntity(this.poisonHist);
	
	this.attractHist = new Histogram(game, 810, 400, "Attract Food Difference Dist.")
    this.game.addEntity(this.attractHist);
	
	this.healPoiHist = new Histogram(game, 810, 600, "Heal Poison Range")
    this.game.addEntity(this.healPoiHist);
	
	this.cellHist = new Histogram(game, 1210, 0, "Cell Dist.")
	this.game.addEntity(this.cellHist);
	
	this.colorCirc = new colorCircle(game, 1390, 590, "Poison Genome Dist.");
	this.game.addEntity(this.colorCirc);
	
    // create board
    this.board = [];
    for (var i = 0; i < this.dimension; i++) {
        this.board.push([]);
        for (var j = 0; j < this.dimension; j++) {
            this.board[i].push(new Cell(game,i,j));
        }
    }

    // add agents
    while (this.agents.length < this.populationSize) {
        var x = randomInt(100);
        var y = randomInt(100);

        var agent = new Agent(game, x, y);
        this.agents.push(agent);
    }

};
Automata.prototype.logData = function () {
    var data = {
        run: this.title,
		params: params,
        foodData: this.weightData,
        poisonData: this.poisonData,
        attractData: this.attractData,
        avoidData: this.avoidData,
        cellData: this.cellData,
		popCells: this.totalPopCell,
		popAgents: this.totalPopAgent,
		deviationAgent: this.standardDeviationAgent,
		deviationCell: this.standardDeviation,
		cellFoodDiff: this.cellAgentFoodDiff,
		poisonAvoidDiff: this.poisonAvoidDiff,
		foodAttractDiff: this.foodAttractDiff,
		healPoiData: this.healPoiData
    };

    if (socket) {
		socket.emit("saveCA", data);
		console.log("sent to database");
	}
};
Automata.prototype.updateData = function () {
	var cellGenomes = [];
	var agentGenomes = [];
    var weightData = [];
	var healPoiData = [];
	var poisonData = [];
	var attractData = [];
	var avoidData = [];
	var cellData = [];
	var colorCircData = [];
    var redPop = 0;
    var greenPop = 0;
	var whitePop = 0;
	var totalPopCell = 0;
	var totalPopAgent = this.agents.length;
	//console.log(standardDeviation);
	
    for (var i = 0; i < 20; i++) {
		healPoiData.push(0);
        weightData.push(0);
		poisonData.push(0);
		attractData.push(0);
		avoidData.push(0);
		cellData.push(0);
    }
	for(var i = 0; i < 360; i++) {
		colorCircData.push(0);
	}
    for (var i = 0; i < 100; i++) {
        for (var j = 0; j < 100; j++) {
            var cell = this.board[i][j];
			if (cell.color !== "Black" && cell.color !== "White") {
				cellGenomes.push(cell.genome);
				totalPopCell+=1;
			}
            
        }
    }
	for(var i =0; i< this.agents.length; i++){
		var agent = this.agents[i];
		agentGenomes.push(agent.genomeFood);
	}
	var standardDeviationAgent = Math.trunc(standardDev(agentGenomes) * 10000);
	var standardDeviation = Math.trunc(standardDev(cellGenomes) * 10000);
    for (var k = 0; k < this.agents.length; k++) {
        var weightIndex = Math.floor(this.agents[k].genomeFood * 20) < 20 ? Math.floor(this.agents[k].genomeFood * 20) : 19;
        weightData[weightIndex]++;
		
		var healPoiIndex = Math.floor(this.agents[k].genomeHealPoisonRange * 20) < 20 ? Math.floor(this.agents[k].genomeHealPoisonRange * 20) : 19;
        healPoiData[healPoiIndex]++;
		
		var poisonIndex = Math.floor(this.agents[k].genomePoison * 20) < 20 ? Math.floor(this.agents[k].genomePoison * 20) : 19;
        poisonData[poisonIndex]++;
		
		var attractIndex = Math.abs(Math.floor(this.agents[k].genomeAttract * 20) - Math.floor(this.agents[k].genomeFood * 20)) < 20 ? Math.abs(Math.floor(this.agents[k].genomeAttract * 20) - Math.floor(this.agents[k].genomeFood * 20)) : 19;
        attractData[attractIndex]++;
		
		var avoidIndex = Math.abs(Math.floor(this.agents[k].genomeAvoid * 20) - Math.floor(this.agents[k].genomePoison * 20)) < 20 ? Math.abs(Math.floor(this.agents[k].genomeAvoid * 20) - Math.floor(this.agents[k].genomePoison * 20)) : 19;
        avoidData[avoidIndex]++;
		
		//var colorCircIndex = Math.floor(this.agents[k].genomeFood * 360) < 360 ? Math.floor(this.agents[k].genomeFood * 360) : 359;
        //colorCircData[colorCircIndex]++;
		
    }
	for (var i = 0; i < 100; i++) {
        for (var j = 0; j < 100; j++) {
            var cell = this.board[i][j];
			if(cell.color !== "Black" && cell.color !== "White"){
				var cellIndex = Math.floor(cell.genome * 20) < 20 ? Math.floor(cell.genome * 20) : 19;
				var colorCircIndex = Math.floor(cell.genome * 360) < 360 ? Math.floor(cell.genome * 360) : 359;
				cellData[cellIndex]++;
				colorCircData[colorCircIndex]++;	
			}
			
        }
    }
	this.cellAgentFoodDiff.push(findBiggestDiff(makeAggr(weightData), makeAggr(cellData)));
	
	
	this.poisonAvoidDiff.push(findBiggestDiff(makeAggr(poisonData), makeAggr(avoidData)));
	this.foodAttractDiff.push(findBiggestDiff(makeAggr(weightData), makeAggr(attractData)));
	
    this.weightData.push(weightData);
    this.weightHist.data = this.weightData;
	
	this.healPoiData.push(healPoiData);
	this.healPoiHist.data = this.healPoiData;
	
	this.poisonData.push(poisonData);
    this.poisonHist.data = this.poisonData;
	
	this.attractData.push(attractData);
    this.attractHist.data = this.attractData;
	
	this.avoidData.push(avoidData);
    //this.avoidHist.data = this.avoidData;
	
	this.cellData.push(cellData);
	this.cellHist.data = this.cellData;
	
	this.colorCirc.data = colorCircData;
	
    this.totalPopCell.push(totalPopCell);
	
	this.standardDeviation.push(standardDeviation);
	
	this.totalPopAgent.push(totalPopAgent);
	
	this.standardDeviationAgent.push(standardDeviationAgent);
	
}

Automata.prototype.serialize = function (skip) {
    var text = "tick,popCountAgent,popCountCell,stdDevAgents,stdDevCells,agentCellFoodDiff,avoidPoisonDiff,attractFoodDiff\n";
    for(var i = 0; i < this.totalPopAgent.length; i += skip) {
        text += i + ",";
        text += this.totalPopAgent[i] + ",";
        text += this.totalPopCell[i] + ",";
		text += this.standardDeviationAgent[i] + ",";
		text += this.standardDeviation[i] + ",";
		text += this.cellAgentFoodDiff[i] + ",";
		text += this.poisonAvoidDiff[i] + ",";
		text += this.foodAttractDiff[i] + "\n";
    }

    return text;
}

Automata.prototype.update = function () {
	this.updateCounter++;
	//document.getElementById("counter").innerHTML = this.updateCounter;
	if(this.updateCounter >= params.waitTurns){
		if(this.agents.length == 0 && this.firstDeath){
			document.getElementById("survive").value= this.updateCounter;
			this.firstDeath = false;
		}
		for (var i = 0; i < this.agents.length; i++) {
			this.agents[i].update();
		}

		for (var i = this.agents.length - 1; i >= 0; i--) {
			if (this.agents[i].dead) {
				this.agents.splice(i, 1);
			}
		}
		
	}

    for (var i = 0; i < this.dimension; i++) {
        for (var j = 0; j < this.dimension; j++) {
            this.board[i][j].update();
        }
    }
	//HOW OFTEN THE DATA IS UPDATED
	if(this.updateCounter % 10 == 0){
		this.updateData();
	}
	if(this.updateCounter == params.DLDB && socket && document.getElementById("DB").checked) {
       this.logData();
    }

	if(this.updateCounter == params.DLDB && document.getElementById("download").checked){
		var filename = this.title;
		download(filename + "-stats.csv", this.serialize(1));
	}
};

Automata.prototype.draw = function (ctx) {
    var size = 8;
    for (var i = 0; i < this.dimension; i++) {
        for (var j = 0; j < this.dimension; j++) {
            var cell = this.board[i][j];
            ctx.fillStyle = cell.color;
            ctx.fillRect(i * size, j * size, size, size);
        }
    }

    for (var i = 0; i < this.agents.length; i++) {
        ctx.fillStyle = this.agents[i].color;
        ctx.beginPath();
        ctx.arc((this.agents[i].x * size) + (size / 2), (this.agents[i].y * size) + (size / 2), (size / 2), 0, 2 * Math.PI, false);
        ctx.fill();
    }
};