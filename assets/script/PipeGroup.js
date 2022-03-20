cc.Class({
    extends: cc.Component,
    properties: {
        /**  */
        topPipeMinHeight: 100,
        /**  */
        bottomPipeMinHeight: 100,
        /**  */
        spacingMinValue: 320,
        /**  */
        spacingMaxValue: 400,
        /**  */
        topPipe: cc.Node,
        /**  */
        bottomPipe: cc.Node,
    },

    init(pipeManager) {
        this.pipeManager = pipeManager;
        this._initPositionX();
        this._initPositionY();
        this.topPipe.setScaleX(pipeManager.pipeScale);
        this.bottomPipe.setScaleX(pipeManager.pipeScale);
        this.topPipe.color = cc.hexToColor(pipeManager.pip_color);
        this.bottomPipe.color = cc.hexToColor(pipeManager.pip_color);
    },

    getRealwidth(){
        return this.topPipe.getContentSize().width * this.pipeManager.pipeScale;
    },

    /**  */
    _initPositionX(){
        let visibleSize = cc.director.getVisibleSize(); // 
        let sceneLeft = -visibleSize.width / 2; // 
        let sceneRight = visibleSize.width / 2; // 
        this.node.x = sceneRight + 300;
        this.recylceX = sceneLeft - Math.max(this.topPipe.width, this.bottomPipe.width);
    },

    /**  */
    _initPositionY(){
        let visibleSize = cc.director.getVisibleSize();
        let topPipeMaxY = visibleSize.height / 2 - this.topPipeMinHeight;
        let bottomPipeMinY = cc.find("Canvas/ground").y + this.bottomPipeMinHeight; 
        let spacing = this.spacingMinValue + Math.random() * (this.spacingMaxValue - this.spacingMinValue);
        if(this.pipeManager.prevTop_pos == 0)
        {
            this.topPipe.y = topPipeMaxY - Math.random() * (topPipeMaxY - bottomPipeMinY - spacing);
        }else{
            this.setPipePositions(topPipeMaxY, bottomPipeMinY);
        }
        
        this.bottomPipe.y = this.topPipe.y - spacing;
    },

    setPipePositions(topPipeMaxY, bottomPipeMinY){
        let spacing = this.spacingMinValue + Math.random() * (this.spacingMaxValue - this.spacingMinValue);
        var max_pos = this.pipeManager.pipeSpacing * Math.tan(this.pipeManager.gradient_max * Math.PI / 180);
        var min_pos = this.pipeManager.pipeSpacing * Math.tan(this.pipeManager.gradient_min * Math.PI / 180);
        var pos = min_pos + Math.random() * (max_pos - min_pos);
        
        if(Math.random() > 0.5){
            pos = -1 * pos;
        }
        console.log(this.pipeManager.prevTop_pos);
        if(this.pipeManager.prevTop_pos + pos < topPipeMaxY && this.pipeManager.prevTop_pos + pos - spacing > bottomPipeMinY){
            this.topPipe.y = this.pipeManager.prevTop_pos + pos;
        }else {
            if(this.pipeManager.prevTop_pos - pos - spacing > bottomPipeMinY)
            {
                this.topPipe.y = this.pipeManager.prevTop_pos - pos;
            } else{
                this.topPipe.y = topPipeMaxY - Math.random() * (topPipeMaxY - bottomPipeMinY - spacing);
            }
            
        }
    },

    getTopY(){
        return this.topPipe.y;
    },

    update(dt) {
        if (!this.pipeManager.isRunning) {
            return;
        }
        // 
        this.node.x += this.pipeManager.pipeMoveSpeed * dt;
        // 
        if (this.node.x < this.recylceX) {
            this.pipeManager.recyclePipe(this);
        }
    }
});