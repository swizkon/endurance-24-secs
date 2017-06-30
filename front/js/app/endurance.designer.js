var endurance = window['endurance'] || {};

endurance.designer = {

    isPointOfInterest: function (context, x, y) {
        var inpath = context.isPointInStroke(x, y);

        return inpath != context.isPointInStroke(x - 1, y)
            || inpath != context.isPointInStroke(x + 1, y)
            || inpath != context.isPointInStroke(x, y - 1)
            || inpath != context.isPointInStroke(x, y + 1);
    },

    pointsOfInterest: function (canvas) {
        var context = canvas.getContext("2d");
        var x, y, pointsOfInterest = { "on": [], "off": [], "heat": {} };
        for (y = 0; y < canvas.height; y += 1) {
            for (x = 0; x < canvas.width; x += 1) {

                var inpath = context.isPointInStroke(x, y);

                var type = inpath ? "on" : "off";

                var isOfInterest = endurance.designer.isPointOfInterest(context, x, y);
                if (isOfInterest) {
                    pointsOfInterest[type][pointsOfInterest[type].length] = {
                        'x': x,
                        'y': y
                    };
                    var h = pointsOfInterest["heat"][y.toString()] || {};
                    h[x.toString()] = type == "on" ? 1 : 0;
                    pointsOfInterest["heat"][y.toString()] = h;
                }   
            }
        }

        // Delete every heat

        return pointsOfInterest;
    }
};
