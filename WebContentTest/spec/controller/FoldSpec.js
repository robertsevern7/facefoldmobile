describe("Fold", function() {
    var foldController;

    var controller, app;
    beforeEach(function () {
        app = Ext.create('Ext.app.Application', {name: 'FaceFold'});
        foldController = Ext.create('FaceFold.controller.Fold', { application: app });
        foldController.launch();
    });

    afterEach(function() { app.destroy(); })

    it('Example test', function () {
        expect(1).toEqual(1);
        expect(true).toBeTruthy();
    });
});