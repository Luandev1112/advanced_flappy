const PipeGroup = require('PipeGroup');

cc.Class({
    extends: cc.Component,

    properties: {
        /**  */
        pipePrefab: cc.Prefab,
        /** /s */
        pipeMoveSpeed: -200,
        /**  */
        pipeSpacing: 500,

        spawnInterval: 1,

        counter: 0,

        pipeScale: 1,

        pipeWidth: 100,

        gradient_min: 0,

        gradient_max: 0,

        prevTop_pos: 0,

        pip_color: '#ffffff'
    },

    onLoad() {
        this.pipeList = [];
        this.isRunning = false;
        this.spawnInterval = Math.abs(this.pipeSpacing / this.pipeMoveSpeed);
    },

    startSpawn(){
        this._spawnPipe();
        this.isRunning = true;
    },

    _spawnPipe(){
        let pipeGroup = null;
        if (cc.pool.hasObject(PipeGroup)) {
            pipeGroup = cc.pool.getFromPool(PipeGroup);
        } else {
            pipeGroup = cc.instantiate(this.pipePrefab).getComponent(PipeGroup);
        }
        this.node.addChild(pipeGroup.node);
        pipeGroup.node.active = true;
        pipeGroup.init(this);
        this.pipeList.push(pipeGroup);
        this.pipeWidth = pipeGroup.getRealwidth();
        this.prevTop_pos = pipeGroup.getTopY();
    },

    recyclePipe(pipe) {
        pipe.node.removeFromParent();
        pipe.node.active = false;
        cc.pool.putInPool(pipe);
    },

    /**  */
    getNext() {
        return this.pipeList.shift();
    },

    reset() {
        this.pipeList = [];
        this.isRunning = false;
    },

    increaseSpeed(sp) {
        this.pipeMoveSpeed -= sp;
        this.spawnInterval = Math.abs(this.pipeSpacing / this.pipeMoveSpeed);
    },

    setSpeed(sp) {
        this.pipeMoveSpeed = -1 * sp;
        this.spawnInterval = Math.abs(this.pipeSpacing / this.pipeMoveSpeed);
    },

    setScale(scale)
    {
        let randscale = parseFloat(scale.min) + Math.random() * (parseFloat(scale.max) - parseFloat(scale.min));
        this.pipeScale = randscale;
    },

    setPipespacing(space){
        this.pipeSpacing = space * 1 + this.pipeWidth;
        console.log(this.pipeSpacing);
    },

    setGradient(min, max)
    {
        this.gradient_min = min;
        this.gradient_max = max;
    },

    setPipColor(clr)
    {
        this.pip_color = clr;
    },

    update (dt) {
        if(this.isRunning)
        {
            this.counter += dt;
            if(this.counter >= this.spawnInterval)
            {
                this._spawnPipe();
                this.counter = 0; 
            }
        }
    },
});
