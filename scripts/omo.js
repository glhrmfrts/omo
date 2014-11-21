function Tile(x, y) {

	this.x = x;
	this.y = y;
	this.element;
	this.correct;
	this.position;
	this.clicked;
	this.margin = 5;
}

Tile.prototype.insert = function() {
	$('#game').append(this.element);
}

Tile.prototype.light = function() {
	var c = this.element.className;
	this.element.className = c + ' light-up';
}

Tile.prototype.initLight = function() {
	var c = this.element.className;
	this.element.className = c + ' init-light-up cheater';
	this.correct = true;
}

Tile.prototype.lightIncorrect = function() {
	var c = this.element.className;
	this.element.className = c + ' light-incorrect';
}

Tile.prototype.remove = function() {
	this.element.remove();
}

function Omo() {

	this.size;
	this.score = 0;
	this.tiles = [];
	this.correctTiles = [];
	this.wrongTiles = [];
	this.difficult = 6;
	this.over;
	this.tries = 0;
	this.maxTries;
	this.objective;
	this.audios = [];
	this.playAudio = 0;
}

Omo.prototype.loadAudios = function() {

	var self = this;

	for (var i = 0; i < 16; i++) {
		if (i < 16) {
			var audio = new Audio('assets/sounds/audio_'+i+'.mp3');
			self.audios.push(audio);
		}
	}
}

Omo.prototype.setSize = function(size) {
	this.size = size;
}

Omo.prototype.init = function() {

	this.tries += 1;
	this.tiles = [];
	this.correctTiles = [];
	this.wrongTiles = [];
	this.playAudio = 0;
	this.audioIncreasing = true;

	if (this.size == 3) {
		this.objective = 30;
		this.difficult = 4;
		this.maxTries = 10;
	} else if (this.size == 4) {
		this.objective = 40;
		this.difficult = 6;
		this.maxTries = 8;
	} else if (this.size == 6) {
		this.objective = 50;
		this.difficult = 10;
		this.maxTries = 6;
	}

	$('.u-m').hide();
	$('.menu-score').html('<h2>Pontos<br><span id="score"></span></h2>');
	$('.menu-tries').html('<h2>Tentativas<br><span id="tries"></span></h2>');

	var gameContainer = $('#game'),
		self = this;

	for (var y = 0; y < self.size; y++) {
		for (var x = 0; x < self.size; x++) {
			var tile = new Tile(x,y);
			var tileDom = document.createElement('div');
			tileDom.id = 'tile-'+ x +'-'+ y;
			tileDom.className = 'tile col-sm-'+ (12 / self.size);
			tileDom.setAttribute('onmouseover', 'game.handleClick(this)');
			tileDom.style.width = ((600 / this.size) - (tile.margin * 2)) + 'px';
			tileDom.style.height = tileDom.style.width;
			tileDom.style.margin = tile.margin +'px';

			tile.element = tileDom;
			tile.position = self.tiles.length;
			self.tiles.push(tile);

			tile.insert();
		}
	}

	this.lightRandomTiles();
}

Omo.prototype.lightRandomTiles = function() {
	var self = this;

	while (self.correctTiles.length < this.difficult) {

		var r = Math.floor(Math.random() * self.tiles.length);
		var tile = self.tiles[r];

		if (!tile.correct) {
			tile.initLight();
			self.correctTiles.push(tile);
		}
	}

	this.setScore(this.score + this.correctTiles.length);
}

Omo.prototype.handleClick = function(tileElement) {

	if (this.over) {
		return false;
	}

	var a = tileElement.id.split('-');
	var i = this.coordinatesToIndex(parseInt(a[1]), parseInt(a[2]));
	var tile = this.tiles[i];

	if (!tile.clicked) {
		if (this.playAudio < this.audios.length && this.audioIncreasing) {
			var audio = this.audios[this.playAudio];
			audio.play();
			this.playAudio++;
		} else {
			if (this.audioIncreasing) {
				this.playAudio = this.audios.length - 1;
			}
			this.audioIncreasing = false;
		}

		if (this.playAudio >= 0 && !this.audioIncreasing) {
			var audio = this.audios[this.playAudio];
			audio.play();
			this.playAudio -= 1;
		} else {
			if (!this.audioIncreasing) {
				this.playAudio = 0;
			}
			this.audioIncreasing = true;
		}
	}

	tile.light();
	tile.clicked = true;

	if (tile.correct) {
		this.correctTiles = this.correctTiles.filter(function(t) {
			return (t.position != tile.position);
		});
	} else {
		this.wrongTiles.push(tile);
	}

	if (this.correctTiles.length == 0) {
		this.endGame();
	}
}

Omo.prototype.coordinatesToIndex = function(x,y) {
	return (y * this.size) + x;
}

Omo.prototype.setScore = function(score) {
	this.score = score;
	$('#game-score').val(parseInt(this.score));
	document.getElementById('score').innerHTML = ''+ parseInt(this.score);
	document.getElementById('tries').innerHTML = ''+ parseInt(this.maxTries - this.tries);
}

Omo.prototype.endGame = function() {

	var self = this;

	this.over = true;

	for (var i = 0; i < self.tiles.length; i++) {
		var tile = self.tiles[i];

		if (tile.clicked) {
			if (tile.correct) {
				tile.light();
			} else {
				tile.lightIncorrect();
			}
		}
	}

	$('#game').addClass('out');

	window.setTimeout('game.afterEnd()', 7000);
}

Omo.prototype.afterEnd = function() {
	console.log('oi');
	var self = this;

	for (var i = 0; i < self.tiles.length; i++) {
		var tile = self.tiles[i];
		tile.remove();
	}

	if (this.tries >= this.maxTries || this.score >= this.objective) {

		var greeting = document.createElement('div');
		greeting.className = 'greeting';

		if (this.score < this.objective) {
			greeting.innerHTML = '<p>Você perdeu! Não atingiu seu objetivo. :(</p>';
		} else {
			greeting.innerHTML = '<p>Parabéns! Você atingiu seu objetivo. :)</p>';
		}

		greeting.innerHTML += '<ul>';
		greeting.innerHTML += '<li>Seu objetivo: '+ this.objective +'</li>';
		greeting.innerHTML += '<li>Seus pontos: '+ this.score +'</li>';
		greeting.innerHTML += '</ul>';

		greeting.innerHTML += '<br>';
		greeting.innerHTML += '<a href="/" class="btn play-again-btn">Jogar de novo</a>';
		greeting.innerHTML += '<br>';
		greeting.innerHTML += '<br>';

		$('#game').append(greeting);
	} else {
		this.over = false;

		this.score = (this.score - this.wrongTiles.length);
		game.init();
	}
}

game = new Omo();
game.loadAudios();

$(function() {
	$('.new-game-btn').on('click', function() {
		var boardSize = $(this).attr('id').split('-');
		game.setSize(parseInt(boardSize[1]));		
		game.init();
	});
});


