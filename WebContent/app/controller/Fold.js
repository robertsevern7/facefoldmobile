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
            this.setScale(widthScale);
        } else {
            this.canvas.width = heightScaledWidth;
            this.canvas.height = heightScaledHeight;
            this.setScale(heightScale);
        }

        //scale down a bit
        //this.canvas.height = this.canvas.height * 0.95
        //this.canvas.width = this.canvas.width * 0.95

        holder.setWidth(this.canvas.width);
        holder.setHeight(this.canvas.height);
    },

    setScale: function (scale) {
        this.scale = scale;
    },

    addMouseEventListeners: function() {
        this.canvas.addEventListener('mousedown',  Ext.bind(this.mouseDownHandler, this), false);
        this.canvas.addEventListener('mousemove',  Ext.bind(this.mouseMoveHandler, this), false);
        this.canvas.addEventListener('mouseup',  Ext.bind(this.mouseUpHandler, this), false);
    },

    insideRenderedRegion: function(clickLocation, scrunches, maxSize) {
        var after = this.getYOffset(this.scrunches) * this.scale;
		var scrunchesSize = maxSize;
		for (var i = 0, size = scrunches.length; i < size; ++i) {
		    if (scrunches[i].dir === this.DIR.UP) {
		        scrunchesSize -= (scrunches[i].end - scrunches[i].start);
		    }
		}

		return (clickLocation > after && clickLocation < scrunchesSize * this.scale);
	},

	mouseDownHandler: function(ev) {
		var position = this.getMousePosition(ev);
                            console.log(position.y)
		if (!this.insideRenderedRegion(position.y, this.scrunches, this.image.height)) {
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
		this.clearMouseDragItems();
	},

	clearMouseDragItems: function() {
	    delete this._currentScrunch;
        delete this._precedingScrunch;
        delete this._followingScrunch;
        delete this._currentPrecedingScrunch;
	},

    DIR: {
        UP: 'UP',
        DOWN: 'DOWN'
    },

	renderNewFold: function(x, y) {
        this._computeCurrentScrunch(x, y);
		this.applyScrunches(this.scrunches);
	},

	_computeCurrentScrunch: function(x, y) {
        var dir = (y - this.yStart) > 0 ? this.DIR.DOWN : this.DIR.UP;
        var top = Math.min(y, this.yStart);
        var bottom = Math.max(y, this.yStart);

        var currId = this._currentScrunch && this._currentScrunch.id;
        var existingOffset = this.getYOffset(this.scrunches, currId);

        var start = top/this.scale - existingOffset;
        var end = bottom/this.scale - existingOffset;

        if (!this._currentScrunch) {
            this.previousScrunchData = this.findPreviousScrunchData(this.yStart);
            var index = this.previousScrunchData.index;
            var nextIndex = index + 1;
            var offset = this.previousScrunchData.offset;
            var previous = (index >= 0) && this.scrunches[this.previousScrunchData.index];
            var next = (nextIndex < this.scrunches.length) &&  this.scrunches[nextIndex];

            this.minDrag = (previous && previous.end) || 0
            this.maxDrag = (next && next.start) || this.image.height;

            var startScrunch = Math.max(start + offset, this.minDrag);
            var endScrunch = Math.min(end + offset, this.maxDrag);

            this._currentScrunch = this.addScrunch(startScrunch, endScrunch, dir);
        } else {
            var offset = this.previousScrunchData.offset;
            var startScrunch = Math.max(start + offset, this.minDrag);
            var endScrunch = Math.min(end + offset, this.maxDrag);

            this._currentScrunch.start = startScrunch;
            this._currentScrunch.end = endScrunch;
            this._currentScrunch.dir = dir;
        }

        return this._currentScrunch;
	},

	getYOffset: function(scrunches, ignoreId) {
	    var startPosition = 0;
        for (var i = 0, len = scrunches.length; i < len; ++i) {
            if (scrunches[i].dir === this.DIR.DOWN && (!ignoreId || scrunches[i].id !== ignoreId)) {
                startPosition += (scrunches[i].end - scrunches[i].start);
            }
        }

        return startPosition;
	},

	findPreviousScrunchData: function(y) {
        //No need for a binary search, counts will be so low that it will but about the same to go linear
        var len = this.scrunches.length;

        if (!len) {
            return {
                offset: 0,
                index: -1
            }
        }

        var i = 0;
        var offset = 0;

        for (; i < len; i++) {
            var scrunch = this.scrunches[i];
            if ((scrunch.start - offset) * this.scale > y) {
                return {
                    offset: offset,
                    index: i - 1
                }
            }

            offset += scrunch.end - scrunch.start;
        }

        return {
            offset: offset,
            index: i - 1
        }
	},

	addScrunch: function(start, end, dir) {
        //TODO when I properly support combining x and y scrunches then don't just return yScrunches all the time
        var scrunchArray = this.scrunches;
        var scrunch = {
            start: start,
            end: end,
            dir: dir,
            id: ((new Date()).getTime()).toString() + (Math.random()).toString()
        }
        scrunchArray.push(scrunch);
        this.orderScrunches(scrunchArray);
        return scrunch;
    },

    orderScrunches: function(scrunches) {
        scrunches.sort(function(scrunch1, scrunch2) {
            return scrunch1.start > scrunch2.start;
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

        var startPosition = this.getYOffset(this.scrunches) * this.scale;

        for (var i = 0, len = sections.length; i < len; ++i) {
            var section = sections[i];
            var sectionSize = section.imageEnd - section.imageStart;
            this.context.drawImage(this.image, 0, section.imageStart, this.image.width, sectionSize, 0, startPosition, this.canvas.width, sectionSize * this.scale);

            if (i !== (length - 1)) {
                this.raggedLine(startPosition);
            }

            startPosition += sectionSize * this.scale;
        }
    },

    getSectionRanges: function(scrunches, imageSize) {
        var sectionRanges = [];

        if (!scrunches.length) {
            sectionRanges.push({
                imageStart: 0,
                imageEnd: imageSize
            });
        } else {
            for (var i = 0, len = scrunches.length; i < len; ++i) {
                var scrunch = scrunches[i];
                var prev = (i > 0) && scrunches[i - 1];
                sectionRanges.push({
                    imageStart: prev && prev.end || 0,
                    imageEnd: scrunch.start
                });
            }

            sectionRanges.push({
                imageStart: scrunch.end,
                imageEnd: imageSize
            });
        }


        return sectionRanges
    },

    raggedLine: function(startPoint) {
        var grd = this.context.createLinearGradient(0, startPoint, 0.1, startPoint + 10);
        grd.addColorStop(0.05,"black");
        grd.addColorStop(0.95,"transparent");
        this.context.fillStyle = grd;
        this.context.fillRect(0, startPoint, this.canvas.width, this.canvas.height);
    }
});