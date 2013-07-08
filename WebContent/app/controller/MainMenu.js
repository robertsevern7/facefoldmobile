Ext.define('FaceFold.controller.MainMenu', {
    extend: 'Ext.app.Controller',
    requires: ['Ext.device.Camera'],
    config: {
        refs: {
            nav: 'main'
        },
        control: {
            'mainmenu': {
                //TODO need to launch the camera, or get an image from the gallery
                itemtap: 'launchImageView'
            }
        }
    },

    launchImageView: function(item, index, target, record) {
        var source = (record.getRoute() === 'openCamera') ? 'camera' : 'library';
        Ext.device.Camera.capture({
            success: function(image) {
                this.getNav().add({
                    imageUrl: image,
                    xtype: 'foldhold'
                })
            },
            scope: this,
            source: source,
            quality: 75,
            width: 200,
            height: 200,
            destination: 'data'
        });
    }
});