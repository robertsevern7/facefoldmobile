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

    it('findPreviousScrunchData UP', function() {
        expect(-1).toEqual(foldController.findPreviousScrunchData(50).index);

        foldController.addScrunch(10, 20, foldController.DIR.UP);
        expect(-1).toEqual(foldController.findPreviousScrunchData(5).index);
        expect(0).toEqual(foldController.findPreviousScrunchData(5).offset);

        expect(0).toEqual(foldController.findPreviousScrunchData(15).index);
        expect(10).toEqual(foldController.findPreviousScrunchData(15).offset);

        foldController.addScrunch(30, 40, foldController.DIR.UP);
        expect(-1).toEqual(foldController.findPreviousScrunchData(5).index);
        expect(0).toEqual(foldController.findPreviousScrunchData(5).offset);

        expect(0).toEqual(foldController.findPreviousScrunchData(15).index);
        expect(10).toEqual(foldController.findPreviousScrunchData(15).offset);

        expect(1).toEqual(foldController.findPreviousScrunchData(25).index);
        expect(20).toEqual(foldController.findPreviousScrunchData(25).offset);

        expect(1).toEqual(foldController.findPreviousScrunchData(55).index);
        expect(20).toEqual(foldController.findPreviousScrunchData(55).offset);
    });

    it('findPreviousScrunchData DOWN', function() {
        foldController.scale = 2;
        foldController.addScrunch(20, 40, foldController.DIR.DOWN);
        expect(-1).toEqual(foldController.findPreviousScrunchData(60).index);
        expect(0).toEqual(foldController.findPreviousScrunchData(60).offset);

        expect(0).toEqual(foldController.findPreviousScrunchData(100).index);
        expect(20).toEqual(foldController.findPreviousScrunchData(100).offset);

        foldController.addScrunch(100, 140, foldController.DIR.DOWN);
        expect(-1).toEqual(foldController.findPreviousScrunchData(60).index);
        expect(0).toEqual(foldController.findPreviousScrunchData(60).offset);

        expect(-1).toEqual(foldController.findPreviousScrunchData(100).index);
        expect(0).toEqual(foldController.findPreviousScrunchData(100).offset);

        expect(0).toEqual(foldController.findPreviousScrunchData(200).index);
        expect(20).toEqual(foldController.findPreviousScrunchData(200).offset);

        expect(0).toEqual(foldController.findPreviousScrunchData(279).index);
        expect(20).toEqual(foldController.findPreviousScrunchData(279).offset);

        expect(1).toEqual(foldController.findPreviousScrunchData(281).index);
        expect(60).toEqual(foldController.findPreviousScrunchData(281).offset);
    })

    it ('_computeCurrentScrunch1', function() {
        //image size 1000
        //scaling factor 2
        //Drag down from 100 to 200
        foldController.yStart = 40;
        foldController.scale = 2;
        foldController.image = {
            height: 1000
        };
        var scrunch = foldController._computeCurrentScrunch(1, 80);
        expect(20).toEqual(scrunch.start);
        expect(40).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        foldController.clearMouseDragItems();

        foldController.yStart = 60;
        scrunch = foldController._computeCurrentScrunch(50, 80);
        expect(10).toEqual(scrunch.start);
        expect(20).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        foldController.clearMouseDragItems();
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
        var scrunch = foldController._computeCurrentScrunch(1, 200);
        expect(50).toEqual(scrunch.start);
        expect(100).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        scrunch = foldController._computeCurrentScrunch(1, 300);
        expect(50).toEqual(scrunch.start);
        expect(150).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        foldController.clearMouseDragItems();

        foldController.yStart = 1000;
        scrunch = foldController._computeCurrentScrunch(1, 800);
        expect(400).toEqual(scrunch.start);
        expect(500).toEqual(scrunch.end);
        expect(foldController.DIR.UP).toEqual(scrunch.dir);

        scrunch = foldController._computeCurrentScrunch(1, 1400);
        expect(500).toEqual(scrunch.start);
        expect(700).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        foldController.clearMouseDragItems();

        //Check limiting when between folds
        foldController.yStart = 650;
        scrunch = foldController._computeCurrentScrunch(1, 0);
        expect(0).toEqual(scrunch.start);
        expect(25).toEqual(scrunch.end);
        expect(foldController.DIR.UP).toEqual(scrunch.dir);

        scrunch = foldController._computeCurrentScrunch(1, 2000);
        expect(25).toEqual(scrunch.start);
        expect(50).toEqual(scrunch.end);
        expect(foldController.DIR.DOWN).toEqual(scrunch.dir);

        //Check limiting after last
        foldController.clearMouseDragItems();

        foldController.yStart = 800;
        scrunch = foldController._computeCurrentScrunch(1, 5000);
        expect(200).toEqual(scrunch.start);
        expect(500).toEqual(scrunch.end);
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

    it('orderScrunches test', function () {
        var scrunches = [{
            start: 130,
            end: 160
        },{
            start: 100,
            end: 120
        },{
            start: 115,
            end: 125
        }];

        foldController.orderScrunches(scrunches);

        expect(3).toEqual(scrunches.length);
        expect(100).toEqual(scrunches[0].start);
        expect(115).toEqual(scrunches[1].start);
        expect(130).toEqual(scrunches[2].start);
     });
});