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
        var canvas = document.getElementById('myCanvas');

        if (!canvas || !canvas.getContext) {
            return;
        }

        var context = canvas.getContext('2d');
        if (!context || !context.drawImage) {
            return;
        }

        var image = new Image();
        var that = this;
        image.addEventListener('load', function () {

            that.sizeCanvasAndImage(this, canvas);
            context.drawImage(this, 0, 0, canvas.width, canvas.height);
            //applyScrunches(that.yScrunches, context, canvas, true);
        }, false);

        //TODO this needs to be loaded from the selected image
        image.src = 'resources/icons/kemp.jpg';
    },

    sizeCanvasAndImage: function(image, canvas) {
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
            canvas.width = widthScaledWidth;
            canvas.height = widthScaledHeight;
        } else {
            canvas.width = heightScaledWidth;
            canvas.height = heightScaledHeight;
        }

        //scale down a bit
        canvas.height = canvas.height * 0.95
        canvas.width = canvas.width * 0.95

        holder.setWidth(canvas.width);
        holder.setHeight(canvas.height);
    }
});