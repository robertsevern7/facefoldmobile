Ext.define('FaceFold.controller.Fold', {
    extend: 'Ext.app.Controller',
    config: {
        refs: {
            foldView: {
                selector: 'fold',
                xtype: 'fold'
            }
        },
        control: {
            'fold': {
                show: 'loadImage'
            }
        }
    },

    loadImage: function(item, index, target, record) {
        this.canvas = document.getElementById('myCanvas');

        if (!this.canvas || !this.canvas.getContext) {
            return;
        }

        this.context = this.canvas.getContext('2d');
        if (!this.context || !this.context.drawImage) {
            return;
        }

        this.image = new Image();
        var that = this;
        this.image.addEventListener('load', function () {

            that.sizeCanvasAndImage.call(that, this);
            that.addMouseEventListeners.call(that);
            that.applyScrunches.call(that, []);

        }, false);

        //TODO this needs to be loaded from the selected image
        this.image.src = 'resources/icons/kemp.jpg';

        this.scrunches = [];
        this.startBuffer = 0;
        this.drags = [];
        this.endBuffer = 0;

        this.started = false;
    },

    sizeCanvasAndImage: function(image) {
        var aspectRatio = image.height/image.width;
        var foldView = this.getFoldView();
        var holder = new Ext.Element(Ext.DomQuery.selectNode('.canvasholder'));

        var fullWidth = foldView.element.getWidth();
        var fullHeight = foldView.element.getHeight();

        var widthScale = fullWidth/image.width;
        var heightScale = fullHeight/image.height;

        var widthScaledWidth = image.width*widthScale;
        var widthScaledHeight = image.height*widthScale;

        var heightScaledWidth = image.width*heightScale;
        var heightScaledHeight = image.height*heightScale;

        if (widthScaledWidth <= fullWidth && widthScaledHeight <= fullHeight) {
            this.canvas.width = widthScaledWidth;
            this.canvas.height = widthScaledHeight;
            this.scale = widthScale;
        } else {
            this.canvas.width = heightScaledWidth;
            this.canvas.height = heightScaledHeight;
            this.scale = heightScale;
        }

        //scale down a bit
        //this.canvas.height = this.canvas.height * 0.95
        //this.canvas.width = this.canvas.width * 0.95

        holder.setWidth(this.canvas.width);
        holder.setHeight(this.canvas.height);
    },

    addMouseEventListeners: function() {
        this.canvas.addEventListener('mousedown',  Ext.bind(this.mouseDownHandler, this), false);
        this.canvas.addEventListener('mousemove',  Ext.bind(this.mouseMoveHandler, this), false);
        this.canvas.addEventListener('mouseup',  Ext.bind(this.mouseUpHandler, this), false);
    },

    insideRenderedRegion: function(clickLocation, scrunches, maxSize) {
		var scrunchesSize = maxSize;
		for (var i = 0, size = scrunches.length; i < size; ++i) {
			scrunchesSize -= scrunches[i].grabSize;
		}
		return (clickLocation > scrunchesSize);
	},

	mouseDownHandler: function(ev) {
		var position = this.getMousePosition(ev);

		if (this.insideRenderedRegion(position.y, this.scrunches, this.image.height)) {
			return true;
		}
		this.xStart = position.x;
		this.yStart = position.y;
		this.started = true;
	},

	mouseUpHandler: function(ev) {
		if (!this.started) {
			return;
		}
		this.started = false;
		var position = this.getMousePosition(ev);
		this.renderNewFold(position.x, position.y);
		delete this._currentScrunch;
		delete this._precedingScrunch;
		delete this._followingScrunch;
		delete this._currentPrecedingScrunch;
	},

	renderNewFold: function(x, y) {
	    this.startBuffer = Math.max(y - this.yStart);

		var startPoint = Math.min(this.yStart, y) + (this._currentPrecedingScrunch || 0);
		var grabSize = Math.abs(this.yStart - y);

		if (!this._currentScrunch) {
			this._currentScrunch = this.addScrunch(startPoint, grabSize);
			var index = this.scrunches.indexOf(this._currentScrunch);
			this._precedingScrunch = (index > 0) ? this.scrunches[index - 1] : undefined;
			this._followingScrunch = (index + 1 < this._currentScrunch.length) ? this.scrunches[index + 1] : undefined;
			this._currentPrecedingScrunch = this.getPrecedingTotalScrunch(this.scrunches, index);
		} else {
			min = this._precedingScrunch && (this._precedingScrunch.startPoint + this._precedingScrunch.grabSize + 5) || 0;
			max = this._followingScrunch && (this._followingScrunch.startPoint + this._followingScrunch.grabSize - 5) || this.image.height;

			this._currentScrunch.startPoint = Math.max(startPoint, min);
			this._currentScrunch.grabSize = grabSize;
		}
		this.applyScrunches(this.scrunches);
	},

	addScrunch: function(startPoint, size) {
        //TODO when I properly support combining x and y scrunches then don't just return yScrunches all the time
        var scrunchArray = this.scrunches;
        var scrunch = {
            startPoint: startPoint,
            grabSize: size
        }
        scrunchArray.push(scrunch);
        this.orderScrunches(scrunchArray);
        return scrunch;
    },

    orderScrunches: function(scrunches) {
        scrunches.sort(function(scrunch1, scrunch2) {
            return scrunch1.startPoint > scrunch2.startPoint;
        })
    },

	getPrecedingTotalScrunch: function(scrunches, upto) {
		var totalScrunch = 0;

		for (var i = 0, len = scrunches.length; i < upto && i < len; ++i) {
			totalScrunch += scrunches[i].grabSize;
		}

		return totalScrunch;
	},

	mouseMoveHandler: function(ev) {
		if (!this.started) {
			return;
		}
		var position = this.getMousePosition(ev);
		this.renderNewFold(position.x, position.y);
	},

	getMousePosition: function(ev) {
		if (ev.layerX || ev.layerX == 0) { // Firefox
			x = ev.layerX;
			y = ev.layerY;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
			x = ev.offsetX;
			y = ev.offsetY;
		}

		return {
			x: x,
			y: y
		}
	},

    applyScrunches: function(scrunches) {
        var sections = this.getSectionRanges(scrunches, this.image.height);

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0, len = sections.length; i < len; ++i) {
            var section = sections[i];
            var sectionSize = Math.max(0, section.size);
            this.context.drawImage(this.image, 0, section.actualStart, this.image.width, sectionSize, 0, this.startBuffer + section.drawnStart * this.scale, this.canvas.width, sectionSize * this.scale);

            if (i !== (length - 1)) {
                this.raggedLine(section.drawnStart);
            }
        }
    },

    getSectionRanges: function(scrunches, imageSize) {
        var clonedScrunches = this.cloneArray(scrunches);
        var accumulatedScrunch = 0;
        var accumulatedScrunchPrev = 0;

        var finalPosition = {
            startPoint: imageSize,
            grabSize: 0
        };

        clonedScrunches.push(finalPosition);

        var previousDrag = {
            startPoint: 0,
            grabSize: 0
        };

        var sectionRanges = [];

        for (var i = 0, len = clonedScrunches.length; i < len; ++i) {
            var scrunchI = clonedScrunches[i];
            var startPoint = scrunchI.startPoint;

            sectionRanges.push({
                actualStart: previousDrag.startPoint + previousDrag.grabSize,
                drawnStart: previousDrag.startPoint - accumulatedScrunch,
                size: startPoint - (previousDrag.startPoint + previousDrag.grabSize)
            });

            accumulatedScrunch += previousDrag.grabSize;
            previousDrag = scrunchI;
        }

        return sectionRanges;
    },

    //Note this only clone the array so that adding to it doesn't change the original object - the objects themselves are still references
    cloneArray: function(array) {
        var cloneArray = [];

        for (var i = 0, len = array.length; i < len; ++i) {
            cloneArray.push(array[i]);
        }

        return cloneArray;
    },

    raggedLine: function(startPoint) {
        var grd = this.context.createLinearGradient(0, startPoint, 0.1, startPoint + 10);
        grd.addColorStop(0.05,"black");
        grd.addColorStop(0.95,"transparent");
        this.context.fillStyle = grd;
        this.context.fillRect(0, startPoint, this.canvas.width, this.canvas.height);
    }
});