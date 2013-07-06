Ext.define('FaceFold.view.Fold', {
    extend: 'Ext.Panel',
    xtype: 'fold',
    requires: [
    ],
    config: {
        html: '<div class="canvasholder">' +
                  '<canvas id="myCanvas" class="canvas">' +
                      'Your browser does not have support for Canvas.>' +
                  '</canvas>' +
              '</div>'
    }
});