// Needed to have visible popups
casper.options.viewportSize = {width: 1280, height: 768};


casper.test.begin("3D view popup", function(test) {

    var home_url = casper.cli.options['url-base'] + "/fr/decouverte-de-la-cascade-dars";

    casper.start(home_url, function () {
        test.assertExists(".btn.download.view3d",
                          "Button for view 3D is here.");

        casper.click(".btn.download.view3d");
    });

    casper.waitForSelector("#popup-view3d iframe", function () {
        test.pass("The iframe shows up.");
    });

    casper.run(function () {
        test.done();
    });
});
