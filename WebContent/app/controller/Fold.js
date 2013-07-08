Ext.define('FaceFold.controller.Fold', {
    extend: 'Ext.app.Controller',
    config: {
        refs: {
            foldView: {
                selector: 'fold',
                xtype: 'fold'
            },
            backButton: '#back',
            forwardButton: '#forward'
        },
        control: {
            'foldhold': {
                show: 'loadImage'
            },
            '#back': {
                tap: 'goBack'
            },
            '#forward': {
                tap: 'goForward'
            }
        }
    },

    _addedOrder: [],
    _storedScrunches: [],
    _currentOrderPos: 0, //NOTE THIS IS 1 BASED TO ALLOW FOR EASIER IF STATEMENTS

    goBack: function() {
        if (!this._addedOrder.length || !this._currentOrderPos) {
            return;
        }

        this._currentOrderPos--;
        var remove = this._addedOrder[this._currentOrderPos];
        this.getBackButton().setDisabled(!this._currentOrderPos);
        this.getForwardButton().setDisabled(false);

        for (var i = 0, len = this.scrunches.length; i < len; i++) {
            if (this.scrunches[i].id === remove) {
                break;
            }
        }

        var foundIt = this.scrunches[i];
        var copy = Ext.clone(foundIt);

        var intervalHolder = {};
        intervalHolder.fadeAwayId = setInterval(Ext.bind(this.fadeOutScrunch, this, [i, copy, intervalHolder]), 10);
    },

    fadeOutScrunch: function(i, originalScrunch, intervalHolder) {
        var scrunch = this.scrunches[i];
        scrunch.end -= 3;

        if (scrunch.end <= scrunch.start) {
            clearInterval(intervalHolder.fadeAwayId);
            this.removeScrunch(i, originalScrunch);
        } else {
            this.applyScrunches(this.scrunches);
        }
    },

    removeScrunch: function(i, originalScrunch) {
        this.scrunches.splice(i, 1);
        this._storedScrunches.push(originalScrunch);
        this.applyScrunches(this.scrunches);
    },

    goForward: function() {
        var atEnd = this._currentOrderPos === this._addedOrder.length;
        if (!this._addedOrder.length || atEnd) {
            return;
        }

        this._currentOrderPos++;

        this._addInScrunchAnimated();

        this.getBackButton().setDisabled(false);
        atEnd = this._currentOrderPos === this._addedOrder.length;
        this.getForwardButton().setDisabled(atEnd);
    },

    _addInScrunchAnimated: function() {
        var addIn = this._addedOrder[this._currentOrderPos - 1];

        for (var i = 0, len = this._storedScrunches.length; i < len; i++) {
            if (this._storedScrunches[i].id === addIn) {
                break;
            }
        }

        var foundItArray = this._storedScrunches.splice(i, 1);
        var foundIt = foundItArray.length && foundItArray[0];

        if (foundIt) {
            var copy = Ext.clone(foundIt);
            copy.end = copy.start;
            this.scrunches.push(copy);
            this.orderScrunches(this.scrunches);
            var intervalHolder = {};
            intervalHolder.fadeAwayId = setInterval(Ext.bind(this.fadeInScrunch, this, [i, copy, foundIt, intervalHolder]), 10);
        }
    },

    fadeInScrunch: function(i, scrunch, targetScrunch, intervalHolder) {
        //var scrunch = this.scrunches[i];
        scrunch.end += 3;

        if (scrunch.end > targetScrunch.end) {
            clearInterval(intervalHolder.fadeAwayId);
            scrunch.end = targetScrunch.end;
        }

        this.applyScrunches(this.scrunches);
    },

    _addOrderingItem: function(id) {
        if (this._addedOrder.length > this._currentOrderPos) {
            this._addedOrder.splice(this._currentOrderPos);
        }

        this._addedOrder.push(id);
        this._currentOrderPos = this._addedOrder.length;
        this.getForwardButton().setDisabled(true);
        this.getBackButton().setDisabled(false);
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

        var emptySpaceAtStart = this.getYOffset(this.scrunches);

        var i = 0;
        var offset = 0;

        for (; i < len; i++) {
            var scrunch = this.scrunches[i];
            if ((scrunch.start - offset + emptySpaceAtStart) * this.scale > y) {
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
        this._addOrderingItem(scrunch.id)

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
                this.raggedLine(startPosition, scrunches[i-1].dir);
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

    raggedLine: function(startPoint, dir) {
        var gap = 5;
        var start = (dir === this.DIR.UP) ? startPoint - gap : startPoint;
        var end = (dir === this.DIR.UP) ? startPoint : startPoint + gap;

        var grd = this.context.createLinearGradient(0, start, 0, end);
        grd.addColorStop(0, (dir === this.DIR.UP) ? "transparent" : "black");
        grd.addColorStop(1, (dir === this.DIR.UP) ? "black" : "transparent");

        this.context.fillStyle = grd;
        this.context.fillRect(0, start, this.canvas.width, gap);
    }
});