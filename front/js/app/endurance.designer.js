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
        var x, y, pointsOfInterest = {"on": [], "off": []};
        for (x = 0; x < canvas.width; x += 1) {
            for (y = 0; y < canvas.height; y += 1) {

                var inpath = context.isPointInStroke(x, y);

                var type = inpath ? "on" : "off";
                
                var isOfInterest = endurance.designer.isPointOfInterest(previewCanvasContext, x, y);
                if (isOfInterest) {
                    pointsOfInterest[type][pointsOfInterest[type].length] = {
                        'x': x,
                        'y': y
                    };
                }
            }
        }

        return pointsOfInterest;
    }

};
