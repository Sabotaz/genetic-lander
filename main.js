define([
    "d3.min",
    "helper",
    "lander",
    "level"
], function(d3, Helper, Lander, Level) {

    var NUMBER_OF_LANDERS = 100;
    var MAX_TIMESTEP = 100;

    var level1data = [
        "7000 3000 3.711 1.0 1.0 1 0 4 -90 90",
        "9",
        "0 2500", "100 200", "500 150", "1000 400", "2000 400",
        "2100 110", "6500 350", "6899 300", "6999 2500",
        "4000 2000 0 0 9750 0 0"
    ]

    // Load level
    var level = Object.create(Level).init(level1data);
    level.drawTerrain();

    // How things are run here
    var bestLander = null;
    var times = 0;
    var run = function() {
        if (times <= 0) {
            console.log(bestLander);
            return
        }
        times -= 1;

        // Create landers
        level.landers = [];
        for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
            level.landers.push(
                Object.create(Lander)
                    .init(level.defaultLanderFields)
                    .setColor(Helper.rainbow(NUMBER_OF_LANDERS * 5, i))
            )
        }

        // Best lander may live
        if (bestLander != null) {
            level.landers[0] = bestLander;
            console.log(bestLander.score);
        }

        // Create commands for each lander
        for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
            if (bestLander == null) {
                level.landers[i].createRandomCommands(MAX_TIMESTEP)
            }
            else {
                // Copy from best and mutate
                level.landers[i].copyCommandsAndMutate(bestLander, MAX_TIMESTEP);
            }
        }

        // Fly you fools
        for (var t = 0; t < MAX_TIMESTEP; t++) {
            for (var i = 0; i < NUMBER_OF_LANDERS; i++) {
                var lander = level.landers[i]

                // Set next command
                lander.angle = lander.commands[t][0];
                lander.power = lander.commands[t][1];
            }
            level.tick();
        }
        level.drawLanders();
        bestLander = level.landers.sort(function(a,b) {return b.score-a.score})[0];

        setTimeout(run, 1);
    }

    // Define button
    document.getElementById("run").onclick = function() {
        times = 10000;
        run();
    }
});