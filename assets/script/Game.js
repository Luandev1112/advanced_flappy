var PipeManager = require('PipeManager');
var Bird = require('Bird');
var Scroller = require('Scroller');

cc.Class({
    extends: cc.Component,

    properties: {
        /** gold medal score */
        goldScore: 30,
        /** silver medal score */
        silverScore: 10,
        /** pip manager */
        pipeManager: PipeManager,
        /** bird */
        bird: Bird,
        /** score label */
        scoreLabel: cc.Label,
        /**  */
        maskLayer: {
            default: null,
            type: cc.Node
        },
        /** ground data */
        ground: {
            default: null,
            type: cc.Node
        },
        /**  */
        readyMenu: {
            default: null,
            type: cc.Node
        },
        /**  */
        gameOverMenu: {
            default: null,
            type: cc.Node
        },
        /** score audio */
        scoreAudio: {
            default: null,
            url: cc.AudioClip
        },
        /**  */
        swooshingAudio: {
            default: null,
            url: cc.AudioClip
        },
        medal: {
            default: null,
            type: cc.Node
        },

    },

    onLoad() {
        this.gamesetting = {
            speed: [],
            gradient: [],
            width: [],
            space: [],
            medal: [],
            bg_color: [],
            pipe_color: [],
        };
        this.level = 0;
        this.score = 0;
        this.scoreLabel.string = this.score;
        this.bird.init(this);
        this._enableInput(true);
        this._registerInput();
        this._revealScene();
        this.initialParms();
    },

    initialParms() {
        var that = this;
        let xhr = new XMLHttpRequest();
        const url = 'http://localhost/gamesettings/getsettings/1';
        xhr.onreadystatechange = function () {
            if (4 == xhr.readyState && xhr.status >= 200 && xhr.status < 400) {
                var response = xhr.responseText;
                var setting_arr = JSON.parse(response).gamesettings;
                for(var i = 0; i < setting_arr.length; i++)
                {
                  var key = setting_arr[i].setkey;
                  var val = setting_arr[i].value;
                  var value_arr = JSON.parse(val);
                  switch(key){
                    case 'space':
                        that.gamesetting.space = value_arr;
                    break;
                    case 'width':
                        that.gamesetting.width = value_arr;
                    break;
                    case 'gradient':
                        that.gamesetting.gradient = value_arr;
                    break;
                    case 'speed':
                        that.gamesetting.speed = value_arr;
                    break;
                    case 'medal':
                        that.gamesetting.medal = value_arr;
                    break;
                    case 'bg_color':
                        that.gamesetting.bg_color = value_arr;
                    break;
                    case 'pipe_color':
                        that.gamesetting.pipe_color = value_arr;
                    break;
                  }
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    },

    _revealScene(){
        this.maskLayer.active = true;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(cc.fadeOut(0.3));
    },

    /** restart button clicked event */
    restart(){
        cc.audioEngine.playEffect(this.swooshingAudio);
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeIn(0.3),
                cc.callFunc(()=> {
                    // load new scene
                    cc.director.loadScene('game');
                }, this)
            )
        );
    },

    _gameStart(){
        this.initSetting();
        this._hideReadyMenu();
        this.pipeManager.startSpawn();
        this.bird.startFly();
    },

    gameOver () {
        this.pipeManager.reset();
        this.ground.getComponent(Scroller).stopScroll();
        this._enableInput(false);
        this._blinkOnce();
        this._showGameOverMenu();
    },
    initSetting () {

        this.pipeManager.setSpeed(this.gamesetting.speed[this.level].min);
        this.pipeManager.setScale(this.gamesetting.width[this.level]);
        this.pipeManager.setPipespacing(this.gamesetting.space[this.level].min);
        this.pipeManager.setGradient(this.gamesetting.gradient[this.level].min, this.gamesetting.gradient[this.level].max);
        var background = this.node.getChildByName('background');
        background.color = cc.hexToColor(this.gamesetting.bg_color[this.level].min);
        this.pipeManager.setPipColor(this.gamesetting.pipe_color[this.level].min)
    },

    gainScore () {
        this.score++;
        this.scoreLabel.string = this.score;
        cc.audioEngine.playEffect(this.scoreAudio);

        for(var i = 0; i < this.gamesetting.medal.length; i++)
        {
            if(this.gamesetting.medal[i].min <= this.score && this.score < this.gamesetting.medal[i].max)
            {
                this.level = i + 1;
                this.initSetting();
                break;
            }
        }
    },

    _hideReadyMenu(){
        this.scoreLabel.node.runAction(cc.fadeIn(0.3));
        this.readyMenu.runAction(
            cc.sequence(
                cc.fadeOut(0.5),
                cc.callFunc(()=> {
                    this.readyMenu.active = false;
                }, this)
            )
        );
    },

    /**  */
    _blinkOnce(){
        this.maskLayer.color = cc.Color.WHITE;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeTo(0.1, 200),
                cc.fadeOut(0.1)
            )
        );
    },

    _showGameOverMenu(){
        // 
        this.scoreLabel.node.runAction(
            cc.sequence(
                cc.fadeOut(0.3),
                cc.callFunc(()=> {
                    this.scoreLabel.node.active = false;
                }, this)
            )
        );

        // 
        let gameOverNode = this.gameOverMenu.getChildByName("gameOverLabel");
        let resultBoardNode = this.gameOverMenu.getChildByName("resultBoard");
        let startButtonNode = this.gameOverMenu.getChildByName("startButton");
        let currentScoreNode = resultBoardNode.getChildByName("currentScore");
        let bestScoreNode = resultBoardNode.getChildByName("bestScore");
        let medalNode = resultBoardNode.getChildByName("medal");

        // 
        const KEY_BEST_SCORE = "bestScore";
        let bestScore = cc.sys.localStorage.getItem(KEY_BEST_SCORE);
        if (bestScore === "null" || this.score > bestScore) {
            bestScore = this.score;
        }
        cc.sys.localStorage.setItem(KEY_BEST_SCORE, bestScore);

        // 
        currentScoreNode.getComponent(cc.Label).string = this.score;
        bestScoreNode.getComponent(cc.Label).string = bestScore;

        // 
        let showMedal = (err, spriteFrame) => {
            medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        };

        let medal_level = 0;
        for(var i = 0; i < this.gamesetting.medal.length; i++)
        {
            if(this.gamesetting.medal[i].min <= this.score && this.score < this.gamesetting.medal[i].max)
            {
                medal_level = i + 1;
                break;
            }
        }

        switch(medal_level)
        {
            case 0:
                showMedal();
            break;
            case 1:
                cc.loader.loadRes("image/medal_bronze.png", cc.SpriteFrame, showMedal);
            break;
            case 2:
                cc.loader.loadRes("image/medal_silver.png", cc.SpriteFrame, showMedal);
            break;
            case 3:
                cc.loader.loadRes("image/medal_gold.png", cc.SpriteFrame, showMedal);
            break;
            case 4:
                cc.loader.loadRes("image/medal_pt.png", cc.SpriteFrame, showMedal);
            break;
            case 5:
                cc.loader.loadRes("image/medal_dia.png", cc.SpriteFrame, showMedal);
            break;

        }
        this.level = 0;

        // 
        var showNode = (node, action, callback)=> {
            startButtonNode.active = true;
            cc.audioEngine.playEffect(this.swooshingAudio);
            node.runAction(cc.sequence(
                action,
                cc.callFunc(()=> {
                    if (callback) {
                        callback();
                    }
                }, this)
            ));
        };
        this.gameOverMenu.active = true;
        let showNodeFunc = ()=> showNode(
            gameOverNode,
            cc.spawn(
                cc.fadeIn(0.2),
                cc.sequence(
                    cc.moveBy(0.2, cc.p(0, 10)),
                    cc.moveBy(0.5, cc.p(0, -10))
                )
            ),
            ()=>showNode(
                resultBoardNode,
                cc.moveTo(0.5, cc.p(resultBoardNode.x, -250)).easing(cc.easeCubicActionOut()),
                ()=>showNode(
                    startButtonNode,
                    cc.fadeIn(0.5))
            )
        );
        this.scheduleOnce(showNodeFunc, 0.55);
    },

    _startGameOrJumpBird(){
        if (this.bird.state === Bird.State.Ready) {
            this._gameStart();
        } else {
            this.bird.rise();
        }
    },

    _registerInput () {
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                this._startGameOrJumpBird();
            }.bind(this)
        }, this.node);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                this._startGameOrJumpBird();
                return true;
            }.bind(this)
        }, this.node);
    },

    _enableInput: function (enable) {
        if (enable) {
            cc.eventManager.resumeTarget(this.node);
        } else {
            cc.eventManager.pauseTarget(this.node);
        }
    },
});