Ext.define('FaceFold.store.MainMenuOptions', {
    extend: 'Ext.data.Store',
    xtype: 'mainmenuoptions',
    config: {
        model: 'FaceFold.model.MainMenuOption',
        data: [
            { displayText: 'Take a Photo', icon: 'resources/icons/photo1.png', route: 'openCamera' },
            { displayText: 'Select from Gallery', icon: 'resources/icons/photos1.png', route: 'openGallery' }
        ]
    }
});