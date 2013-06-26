describe("Fold", function() {
    var foldController;

    var controller, app;
    beforeEach(function () {
        app = Ext.create('Ext.app.Application', {name: 'FaceFold'});
        foldController = Ext.create('FaceFold.controller.Fold', { application: app });
        foldController.launch();
    });

    afterEach(function() { app.destroy(); })

    it('sectionRanges test', function () {
        var scrunches = [];

        var sectionRanges = foldController.getSectionRanges(scrunches, 400);

        expect(0).toEqual(scrunches.length);
        expect(1).toEqual(sectionRanges.length);

        var firstSection = sectionRanges[0];
        expect(0).toEqual(firstSection.actualStart);
        expect(0).toEqual(firstSection.drawnStart);
        expect(400).toEqual(firstSection.size);

        //One Scrunch
        scrunches = [{
            startPoint: 130,
            grabSize: 30
        }];

        sectionRanges = foldController.getSectionRanges(scrunches, 400);

        expect(1).toEqual(scrunches.length);
        expect(2).toEqual(sectionRanges.length);

        firstSection = sectionRanges[0];
        expect(0).toEqual(firstSection.actualStart);
        expect(0).toEqual(firstSection.drawnStart);
        expect(130).toEqual(firstSection.size);

        var secondSection = sectionRanges[1];
        expect(160).toEqual(secondSection.actualStart);
        expect(130).toEqual(secondSection.drawnStart);
        expect(240).toEqual(secondSection.size);

        //Two Scrunch
        scrunches = [{
            startPoint: 130,
            grabSize: 30
        },{
            startPoint: 200,
            grabSize: 20
        }];

        sectionRanges = foldController.getSectionRanges(scrunches, 400);

        expect(2).toEqual(scrunches.length);
        expect(3).toEqual(sectionRanges.length);

        firstSection = sectionRanges[0];
        expect(0).toEqual(firstSection.actualStart);
        expect(0).toEqual(firstSection.drawnStart);
        expect(130).toEqual(firstSection.size);

        secondSection = sectionRanges[1];
        expect(160).toEqual(secondSection.actualStart);
        expect(130).toEqual(secondSection.drawnStart);
        expect(40).toEqual(secondSection.size);

        var thirdSection = sectionRanges[2];
        expect(220).toEqual(thirdSection.actualStart);
        expect(170).toEqual(thirdSection.drawnStart);
        expect(180).toEqual(thirdSection.size);
    });

     it('orderScrunches test', function () {
        var scrunches = [{
            startPoint: 130,
            grabSize: 30
        },{
            startPoint: 100,
            grabSize: 20
        },{
            startPoint: 115,
            grabSize: 10
        }];

        foldController.orderScrunches(scrunches);

        expect(3).toEqual(scrunches.length);
        expect(100).toEqual(scrunches[0].startPoint);
        expect(115).toEqual(scrunches[1].startPoint);
        expect(130).toEqual(scrunches[2].startPoint);

        expect(20).toEqual(scrunches[0].grabSize);
        expect(10).toEqual(scrunches[1].grabSize);
        expect(30).toEqual(scrunches[2].grabSize);
     });
});