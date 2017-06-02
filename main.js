define([
    "libs/d3.min",
    "lander",
    "level",
    "test"
], function(d3, Lander, Level, Test) {

    // Test all the things
    Test.run();

    var NUMBER_OF_LANDERS = 200;
    var REPRODUCING_LANDERS = 10;
    var MAX_TIMESTEP = 300;

    var leveldata = {
        "Cave horizontal": [
            "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
            "11",
            "0 2500", "100 1000", "1900 800",
            "2000 100", "3100 100", // Landing area
            "3200 1500", "2000 1600", "2050 1800",
            "4000 1700", "4100 100", "6999 200",

            //Lander config
            "6200 1500 -20 0 1750 0 0"
        ]
    }

    // Load and draw first level
    var firstlevelname = Object.keys(leveldata)[0];
    var firstleveldata = leveldata[firstlevelname]
    var level = Object.create(Level).init(firstleveldata);
    level.drawTerrain();
    var times = 0;
    var bestLander = null;

    // How things are run here
    var run = function() {
        if (times <= 0) {
            console.log(bestLander)
            if (bestLander != null) {
                bestLander.printActualCommands();
            }
            return
        }
        times -= 1;

        // Create initial random landers
        if (level.landers.length == 0) {
            for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
                level.landers.push(
                    Object.create(Lander)
                        .init(level.defaultLanderFields)
                        .createRandomCommands(MAX_TIMESTEP)
                )
            }
        }

        // or evolve existing landers
        else {
            for (var i = REPRODUCING_LANDERS; i < NUMBER_OF_LANDERS; i++) {
                var momIndex = Math.floor(i / REPRODUCING_LANDERS) - 1;
                var dadIndex = i % REPRODUCING_LANDERS;
                level.landers[i].inheritCommands(
                    level.landers[momIndex],
                    level.landers[dadIndex]
                );
            }

            // Reset all landers
            for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
                level.landers[i].reset();
            }
        }

        // Fly you fools
        for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
            var lander = level.landers[i];
            for (var t = 0; t < MAX_TIMESTEP; t++) {
                lander.applyCommand(t);
                lander.tick(level);
            }
            // Lander did not touch terrain
            if (lander.score == -1) {
                lander.calculateScore(level, false);
            }
        }

        // Find best lander
        level.landers = level.landers.sort(function(a,b) {return b.score-a.score});
        bestLander = level.landers[0];

        // Update screen
        if (times % 2 == 0) {
            level.drawLanders();
            console.log("Best score: " + bestLander.score);
            if (bestLander.timestep === MAX_TIMESTEP) {
                console.log("MAX_TIMESTEP reached, maybe increase?")
            }
        }

        // Run again
        setTimeout(run, 20);
    }
    times = 1000 * 1000;
    run();
    
});
