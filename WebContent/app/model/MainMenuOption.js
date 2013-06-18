Ext.define('FaceFold.model.MainMenuOption', {
    extend: 'Ext.data.Model',
    config: {
        fields: ['displayText', 'icon', 'route']
    },

    getRoute: function() {
        return this.get('route');
    }
});