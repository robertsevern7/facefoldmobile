Ext.define('FaceFold.view.Fold', {
    extend: 'Ext.Panel',
    xtype: 'fold',
    requires: [
    ],
    config: {
        height: '100%',
        width: '100%',
        title: 'Get Folding!',
        html: '<div class="canvasholder">' +
                  '<canvas id="myCanvas" class="canvas">' +
                      'Your browser does not have support for Canvas.>' +
                  '</canvas>' +
              '</div>'
    }
});