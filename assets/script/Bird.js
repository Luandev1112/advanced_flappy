const State = cc.Enum({
    /** preparing status */
    Ready: -1,
    /** bird flying */
    Rise: -1,
    /** bird falling */
    FreeFall: -1,
    /** collide with wall */
    Drop: -1,
    /** collide with ground */
    Dead: -1,
});

cc.Class({
    statics: {
        State: State
    },

    extends: cc.Component,

    properties: {
        /** initial speed /s */
        initRiseSpeed: 800,
        /** gravity */
        gravity: 1000,
        animState: 0,
        /** bird status */
        state: {
            default: State.Ready,
            type: State,
        },
        /** ground */
        ground: {
            default: null,
            type: cc.Node
        },
        /** flying audio */
        riseAudio: {
            default: null,
            url: cc.AudioClip
        },
        /** drop audio */
        dropAudio: {
            default: null,
            url: cc.AudioClip
        },
        /** hit audio */
        hitAudio: {
            default: null,
            url: cc.AudioClip
        },
    },

    init(game){
        this.game = game;
        this.state = State.Ready;
        this.currentSpeed = 0;
        this.anim = this.getComponent(cc.Animation);
        this.anim.playAdditive("doveWing");
        this.animState = 1;
    },

    startFly () {
        this._getNextPipe();
        // this.anim.stop("doveWing");
        this.rise();
    },

    _getNextPipe () {
        this.nextPipe = this.game.pipeManager.getNext();
    },

    update (dt) {
        if (this.state === State.Ready || this.state === State.Dead) {
            return;
        }
        this._updatePosition(dt);
        this._updateState(dt);
        this._detectCollision();
        this._fixBirdFinalPosition();
    },

    _updatePosition (dt) {
        var flying = this.state === State.Rise
            || this.state === State.FreeFall
            || this.state === State.Drop;
        if (flying) {
            this.currentSpeed -= dt * this.gravity;
            this.node.y += dt * this.currentSpeed;
        }
    },

    _updateState (dt) {
        switch (this.state) {
            case State.Rise:
                if (this.currentSpeed < 0) {
                    this.state = State.FreeFall;
                    this.anim.stop("doveWing");
                    this.anim.playAdditive("doveFlapping");
                    this.animState = 2;
                    this._runFallAction(0.3, 30);
                }
                break;
            case State.Drop:
                if (this._detectCollisionWithBird(this.ground)) {
                    this.state = State.Dead;
                }
                break;
        }
    },

    _detectCollision () {
        if (!this.nextPipe) {
            return;
        }
        if (this.state === State.Ready || this.state === State.Dead || this.state === State.Drop) {
            return;
        }
        let collideWithPipe = false;
        // check collision with bird and upper pipe
        if (this._detectCollisionWithBird(this.nextPipe.topPipe)) {
            collideWithPipe = true;
        }
        // check collision with bird and bottom pipe
        if (this._detectCollisionWithBird(this.nextPipe.bottomPipe)) {
            collideWithPipe = true;
        }
        // check collision with bird and ground pipe
        let collideWithGround = false;
        if (this._detectCollisionWithBird(this.ground)) {
            collideWithGround = true;
        }
        // handle collision result
        if (collideWithPipe || collideWithGround) {
            cc.audioEngine.playEffect(this.hitAudio);

            if (collideWithGround) { // collision with ground
                this.state = State.Dead;
            } else { // collision with pip
                this.state = State.Drop;
                this._runDropAction();
                this.scheduleOnce(()=> {
                    cc.audioEngine.playEffect(this.dropAudio);
                }, 0.3);
            }

            this.anim.stop();
            this.game.gameOver();
        } else { // handle if there is not any collision
            let birdLeft = this.node.x;
            let pipeRight = this.nextPipe.node.x + this.nextPipe.topPipe.width
            let crossPipe = birdLeft > pipeRight;
            if (crossPipe) {
                this.game.gainScore();
                this._getNextPipe();
            }
        }
    },

    /** fix final falling position */
    _fixBirdFinalPosition(){
        if (this._detectCollisionWithBird(this.ground)) {
            this.node.y = this.ground.y + this.node.width / 2;
        }
    },

    _detectCollisionWithBird(otherNode){
        return cc.rectIntersectsRect(this.node.getBoundingBoxToWorld(), otherNode.getBoundingBoxToWorld());
    },

    rise() {
        // let sceneHeight = window.innerHeight;
        if(this.node.y > 600)
        {
            this.node.y = 600;
        }
        if(this.state == 2 && this.animState == 2)
        {
            this.anim.stop("doveFlapping");
            this.anim.playAdditive("doveWing");
            this.animState = 1;
        }
        this.state = State.Rise;
        this.currentSpeed = this.initRiseSpeed;
        this._runRiseAction();
        cc.audioEngine.playEffect(this.riseAudio);
    },

    _runRiseAction(){
        this.node.stopAllActions();
        let jumpAction = cc.rotateTo(0.3, -30).easing(cc.easeCubicActionOut());
        this.node.runAction(jumpAction);
    },

    _runFallAction(duration = 0.3, fallAngle = 30){
        this.node.stopAllActions();
        let dropAction = cc.rotateTo(duration, fallAngle).easing(cc.easeCubicActionIn());
        this.node.runAction(dropAction);
    },

    _runDropAction(){
        if (this.currentSpeed > 0) {
            this.currentSpeed = 0;
        }
        this._runFallAction(0.4, 90);
    }
});
