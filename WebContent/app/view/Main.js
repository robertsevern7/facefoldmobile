Ext.define('FaceFold.view.Main', {
    extend: 'Ext.NavigationView',
    xtype: 'main',
    requires: [
        'Ext.TitleBar', 'FaceFold.view.MainMenu'
    ],
    config: {
        scrollable: true,
        items: [{
            title: 'FaceFold',
            xtype: 'mainmenu'
        }]
    }
});