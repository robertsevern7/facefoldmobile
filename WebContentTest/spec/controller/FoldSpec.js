describe("Fold", function() {
    var foldController;

    var controller, app;
    beforeEach(function () {
        app = Ext.create('Ext.app.Application', {name: 'FaceFold'});
        foldController = Ext.create('FaceFold.controller.Fold', { application: app });
        foldController.launch();

        foldController.scrunches = [];
        foldController.setScale(1);
    });

    afterEach(function() { app.destroy(); })

    it('findPreviousScrunchData', function() {
        expect(-1).toEqual(foldController.findPreviousScrunchData(50).index);

        foldController.addScrunch(10, 20);
        expect(-1).toEqual(foldController.findPreviousScrunchData(5).index);
        expect(0).toEqual(foldController.findPreviousScrunchData(5).offset);

        expect(0).toEqual(foldController.findPreviousScrunchData(15).index);
        expect(10).toEqual(foldController.findPreviousScrunchData(15).offset);

        foldController.addScrunch(30, 40);
        expect(-1).toEqual(foldController.findPreviousScrunchData(5).index);
        expect(0).toEqual(foldController.findPreviousScrunchData(5).offset);

        expect(0).toEqual(foldController.findPreviousScrunchData(15).index);
        expect(10).toEqual(foldController.findPreviousScrunchData(15).offset);

        expect(1).toEqual(foldController.findPreviousScrunchData(25).index);
        expect(20).toEqual(foldController.findPreviousScrunchData(25).offset);

        expect(1).toEqual(foldController.findPreviousScrunchData(55).index);
        expect(20).toEqual(foldController.findPreviousScrunchData(55).offset);
    });

    it ('_computeCurrentScrunch', function() {
        //image size 1000
        //scaling factor 2
        //Drag down from 100 to 200
        foldController.yStart = 100;
        foldController.scale = 2;
        foldController.image = {
            height: 1000
        };
        var scrunch = foldController._computeCurrentScrunch(50, 200);
        expect(50).toEqual(scrunch.start);
        expect(100).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        scrunch = foldController._computeCurrentScrunch(50, 300);
        expect(50).toEqual(scrunch.start);
        expect(150).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        foldController.clearMouseDragItems();

        foldController.yStart = 1000;
        scrunch = foldController._computeCurrentScrunch(50, 800);
        expect(400).toEqual(scrunch.start);
        expect(500).toEqual(scrunch.end);
        expect(foldController.DIR.UP).toEqual(scrunch.dir);

        scrunch = foldController._computeCurrentScrunch(50, 1400);
        expect(500).toEqual(scrunch.start);
        expect(700).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        foldController.clearMouseDragItems();

        //Check limiting when between folds
        foldController.yStart = 500;
        scrunch = foldController._computeCurrentScrunch(50, 0);
        expect(150).toEqual(scrunch.start);
        expect(350).toEqual(scrunch.end);
        expect(foldController.DIR.UP).toEqual(scrunch.dir);

        scrunch = foldController._computeCurrentScrunch(50, 2000);
        expect(350).toEqual(scrunch.start);
        expect(600).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        //Check limiting after last
        foldController.clearMouseDragItems();

        foldController.yStart = 800;
        scrunch = foldController._computeCurrentScrunch(50, 5000);
        expect(950).toEqual(scrunch.start);
        expect(1000).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        scrunch = foldController._computeCurrentScrunch(50, 5000);
        expect(950).toEqual(scrunch.start);
        expect(1000).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);
    });

    it('getSectionRanges', function() {
        var scrunches = [];
        var ranges = foldController.getSectionRanges(scrunches, 1000);

        expect(1).toEqual(ranges.length);
        expect(0).toEqual(ranges[0].imageStart);
        expect(1000).toEqual(ranges[0].imageEnd);


        scrunches.push({
            start: 100,
            end: 300,
            dir: foldController.DIR.UP
        })
        ranges = foldController.getSectionRanges(scrunches, 1000);

        expect(2).toEqual(ranges.length);
        expect(0).toEqual(ranges[0].imageStart);
        expect(100).toEqual(ranges[0].imageEnd);

        expect(300).toEqual(ranges[1].imageStart);
        expect(1000).toEqual(ranges[1].imageEnd);


        scrunches.push({
            start: 500,
            end: 800,
            dir: foldController.DIR.DOWN
        })
        ranges = foldController.getSectionRanges(scrunches, 1000);

        expect(3).toEqual(ranges.length);
        expect(0).toEqual(ranges[0].imageStart);
        expect(100).toEqual(ranges[0].imageEnd);

        expect(300).toEqual(ranges[1].imageStart);
        expect(500).toEqual(ranges[1].imageEnd);

        expect(800).toEqual(ranges[2].imageStart);
        expect(1000).toEqual(ranges[2].imageEnd);
    })

    /*it('sectionRanges test', function () {
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
     });*/
});