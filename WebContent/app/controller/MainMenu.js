Ext.define('FaceFold.controller.MainMenu', {
    extend: 'Ext.app.Controller',
    config: {
        refs: {
            nav: 'main'
        },
        control: {
            'mainmenu': {
                //TODO need to launch the camera, or get an image from the gallery
                //For now use a hardcoded image
                itemtap: 'launchImageView'
            }
        }
    },

    launchImageView: function(item, index, target, record) {
        this.getNav().add({
            xtype: 'foldhold'
        })
    }
});