enchant();

window.onload = function(){
	var core = new Core(320, 320);
	core.preload('img/kaban.png', 'img/piece1.png', 'img/piece1b.png');
	core.fps = 15;
	
	var posStage = 1;	// 現在のステージ
	var score = 0;		// スコア
	
	// 荷物クラス
	var Piece = Class.create(Sprite, {
		initialize: function(fname, width, height) {
			Sprite.call(this, width, height);
			this.image = core.assets["img/"+fname+".png"];
			this.back = core.assets["img/"+fname+"b.png"];
		},
		ontouchmove: function(e) {
			this.x = e.x - this.width / 2
			this.y = e.y - this.height / 2
		},
		surfaceSet: function(surface) {
			surface.draw(this.back, this.x, this.y);
		},
		surfaceCheck: function(surface) {
			return surface.context.getImageData(this.x, this.y, this.width, this.height);
		}
	});
	
	// ラベル作成クラス
	var createLavel = function(scene, text, align, color, x, y, fontsize, touchStart = null, enterFrame = null, returnFlag = false){
		var label = new Label(text);
		if(align){
			label.textAlign = align;
		} else {
			label.textAlign = 'center';
		}
		if(color){
			label.color = color;
		} else {
			label.color = '#000000';
		}
		label.x = x;
		label.y = y;
		label.font = String(fontsize)+'px sans-serif';
		if(touchStart){
			label.addEventListener(Event.TOUCH_START, touchStart);
		}
		if(enterFrame){
 			label.addEventListener(Event.ENTER_FRAME, enterFrame);
		}
		if(returnFlag) {
			return label;
		} else {
			scene.addChild(label);
		}
	}
	
	core.onload = function() {
		var createTitleScene = function() {
			var scene = new Scene();
			
			scene.backgroundColor = '#dddddd';

			createLavel(scene, 'TAKE A TRIP!', null, null, 0, 96, 28);
			
			var startTouchStart = function(e) {
				core.replaceScene(createStoryScene(posStage));
			}
			var startEnterFrame = function() {
				this.opacity = (new Date()).getMilliseconds() > 500 ? 1 : 0;
			}
			createLavel(scene, '- NEW GAME -', null, null, 0, 196, 14, startTouchStart, startEnterFrame);
			
			createLavel(scene, 'config', null, null, 0, 246, 14, function(e) {
				core.pushScene(createConfigScene());
			});
			
			return scene;
		}
		
		var createConfigScene = function() {
			var scene = new Scene();
			
			scene.backgroundColor = '#ccdddd';
			
			createLavel(scene, 'Config', null, null, 0, 96, 28);
			createLavel(scene, 'back', null, null, 0, 196, 14, function(e) {
				core.popScene(scene);
			});

			return scene;
		}
		
		var createStoryScene = function(stage) {
			var scene = new Scene();
			
			scene.backgroundColor = '#ddccdd';
			
			createLavel(scene, 'Story '+stage, null, null, 0, 96, 28);
			createLavel(scene, 'Next', null, null, 0, 196, 14, function(e) {
				core.replaceScene(createGameScene(stage));
			});

			return scene;
		}

		// ゲーム本体
		var createGameScene = function(stage) {
			var scene = new Scene();
			
			scene.backgroundColor = '#ffffff';
			
			var backImg = new Sprite(320, 320);
			backImg.image = core.assets["img/kaban.png"];
			scene.addChild(backImg);
			
			var pieceList = new Array();
			var stageTime = 300;	// 制限時間（ステージごとに変えて良い）
			
			// ステージごとの処理
			switch(posStage) {
				case 1:
					stageTime = 120;
					var place = [
						[5, 140],
						[5, 190],
						[255, 140],
						[255, 190],
					];
					for(var i = 0; i < 4; i++) {
						var piece = new Piece('piece1', 64, 48);
						piece.x = place[i][0];
						piece.y = place[i][1];
						scene.addChild(piece);
						pieceList.push(piece);
					}

					break;
				case 2:
					var place = [
						[5, 140],
						[5, 190],
						[5, 240],
						[255, 140],
						[255, 190],
						[255, 240],
					];
					for(var i = 0; i < 6; i++) {
						var piece = new Piece('piece1', 64, 48);
						piece.x = place[i][0];
						piece.y = place[i][1];
						scene.addChild(piece);
						pieceList.push(piece);
					}

					break;
				case 3:
					break;
				case 4:
					break;
				case 5:
					break;
				case 6:
					break;
				case 7:
					break;
				case 8:
					break;
				default:
					// ここに入ってくるはずは無いけど、一応。
					break;
			}


			createLavel(scene, 'Stage '+stage, null, null, 10, 24, 28);

			var startTime = core.frame;
			var timer = createLavel(scene, stageTime.toFixed(2), null, null, 10, 78, 14, null, function(e) {
				var time = (stageTime - (core.frame - startTime) / core.fps).toFixed(2);
				if(time < 0) {		// タイムオーバー
					core.replaceScene(createContinueScene());
				} else {
					this.text = time;
				}
			}, true);
			scene.addChild(timer);
			
			// 閉めるラベル
			createLavel(scene, '閉める', null, null, 0, 296, 14, function(e) {
				var surface = new Surface(320, 320);
				surface.draw(core.assets["img/kaban.png"]);
				pieceList.forEach(function(element, index, array){
					element.surfaceSet(surface);
				});
				var tf = false;
				pieceList.forEach(function(element, index, array){
					var map = element.surfaceCheck(surface);
					for(var ix = 3; ix < map.width; ix += 5) {
						for(var iy = Math.floor((ix - 3) / 5) % 5; iy < map.height; iy += 5) {
							if(map.data[iy*map.width*4+ix*4+3] > 128) {
								tf = true;
								break;
							}
						}
						if(tf) break;
					}
				});
				console.log("check: "+tf);
				if(!tf) {		// 閉まる場合
					scene.removeChild(this);
					scene.removeChild(timer);
					
					var plusscore = 100;
					createLavel(scene, '  出発しよう！<br><br>Score: +'+plusscore, null, "#FF0000", 0, 340, 24, function(e) {
							posStage += 1;
							if(posStage > 8) {
								posStage = 1;
								core.replaceScene(createEndScene());
							} else {
								core.replaceScene(createStoryScene(posStage));
							}
					},
					function(e) {
						this.tl.moveTo(0, 100, 40);
					});
				} else {		// 閉まらない場合
 					createLavel(scene, '無理', null, "#FF0000", 320, 160, 24, null, function(e) {
						this.tl.moveTo(-180, 160, 20);
						this.tl.then(function() {
							scene.removeChild(this);
						});
					});
				}
			});
			

			return scene;
		}
		
		var createContinueScene = function(stage) {
			var scene = new Scene();
			
			scene.backgroundColor = '#ddccdd';

			createLavel(scene, '時間切れ！', null, null, 14, 96, 28);
			createLavel(scene, 'つづける', null, null, 0, 196, 14, function(e) {
				core.replaceScene(createGameScene(posStage));
			});
			createLavel(scene, 'やめる', null, null, 0, 246, 14, function(e) {
				posStage = 1;
				core.replaceScene(createTitleScene());
			});

			return scene;
		}

		var createEndScene = function() {
			var scene = new Scene();
			
			scene.backgroundColor = '#ddddcc';

			createLavel(scene, 'おめでとう!', null, null, 0, 96, 28);
			createLavel(scene, 'タイトルへ戻る', null, null, 0, 196, 14, function(e) {
				core.replaceScene(createTitleScene());
			});

			return scene;
		}

		core.replaceScene(createTitleScene());
	}
	core.start();
}
