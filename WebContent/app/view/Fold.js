Ext.define('FaceFold.view.Fold', {
    extend: 'Ext.Panel',
    xtype: 'fold',
    requires: [
        'Ext.Img'
    ],
    config: {
        title: 'Get Folding!',
        items: [{
            xtype: 'img',
            src: 'resources/icons/kemp.jpg',
            height: '100%',
            width: '100%'
        }]
    }
});