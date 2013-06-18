Ext.define('FaceFold.view.MainMenu', {
    extend: 'Ext.dataview.DataView',
    xtype: 'mainmenu',
    requires: [

    ],
    config: {
        itemTpl: '<div class="main-menu-item">' +
                     '<div class="main-menu-item-inner">' +
                         '<div>{displayText}</div>' +
                         '<img src={icon} class="main-menu-item-image"></img>' +
                     '</div>' +
                 '</div>',
        store: 'MainMenuOptions'
    }
});