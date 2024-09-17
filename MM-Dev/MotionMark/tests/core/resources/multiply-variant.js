/*
 * Copyright (C) 2015-2017 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */
(function() {

var MultiplyVariantStage = Utilities.createSubclass(Stage,
    function()
    {
        Stage.call(this);
        this.tiles = [];
        this._offsetIndex = 0;
    }, {

    visibleCSS: [
        ["display", "none", "block"]
    ],
    totalRows: 68,

    initialize: function(benchmark, options)
    {
        Stage.prototype.initialize.call(this, benchmark, options);
        var tileSize = Math.round(this.size.height / this.totalRows);
        if (options.visibleCSS)
            this.visibleCSS = options.visibleCSS;

        // Fill the scene with elements
        var x = Math.round((this.size.width - tileSize) / 2);
        var y = Math.round((this.size.height - tileSize) / 2);
        var tileStride = tileSize;
        var direction = 0;
        var spiralCounter = 2;
        var nextIndex = 1;
        var maxSide = Math.floor(y / tileStride) * 2 + 1;
        this._centerSpiralCount = maxSide * maxSide;
        for (var i = 0; i < this._centerSpiralCount; ++i) {
            this._addTile(x, y, tileSize, Stage.randomInt(0, 359));

            if (i == nextIndex) {
                direction = (direction + 1) % 4;
                spiralCounter++;
                nextIndex += spiralCounter >> 1;
            }
            if (direction == 0)
                x += tileStride;
            else if (direction == 1)
                y -= tileStride;
            else if (direction == 2)
                x -= tileStride;
            else
                y += tileStride;
        }

        this._sidePanelCount = maxSide * Math.floor((this.size.width - x) / tileStride) * 2;
        for (var i = 0; i < this._sidePanelCount; ++i) {
            var sideX = x + Math.floor(Math.floor(i / maxSide) / 2) * tileStride;
            var sideY = y - tileStride * (i % maxSide);

            if (Math.floor(i / maxSide) % 2 == 1)
                sideX = this.size.width - sideX - tileSize + 1;
            this._addTile(sideX, sideY, tileSize, Stage.randomInt(0, 359));
        }
    },

    _addTile: function(x, y, tileSize, rotateDeg)
    {
        var tile = Utilities.createElement("div", { class: "div-" + Stage.randomInt(0,6) }, this.element);
        var halfTileSize = tileSize / 2;
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';
        tile.style.width = tileSize + 'px';
        tile.style.height = tileSize + 'px';
        var visibleCSS = this.visibleCSS[this.tiles.length % this.visibleCSS.length];
        tile.style[visibleCSS[0]] = visibleCSS[1];

        var distance = 1 / tileSize * this.size.multiply(0.5).subtract(new Point(x + halfTileSize, y + halfTileSize)).length();
        var step = Math.max(3, distance / 1.5);
        this.tiles.push({
            element: tile,
            distance: distance,
            active: false,
            visibleCSS: visibleCSS,
        });
        tile.style.setProperty("--rotate_deg", rotateDeg + "deg");
        tile.style.setProperty("--rotate_step", step + "deg");
        // Hardcoding test duration to 10 seconds for now. TBD: replace it with a computed value later.
        tile.style.setProperty("--test_dur", 10);
        // Hardcoding to: test_dur (= 10s) * frame_rate (= 60fps) / num_frames (= 4). TBD: replace with a computed value later.
        tile.style.setProperty("--steps_in_each_kf", 150);

    },

    complexity: function()
    {
        return this._offsetIndex;
    },

    tune: function(count)
    {
        this._offsetIndex = Math.max(0, Math.min(this._offsetIndex + count, this.tiles.length));
        this._distanceFactor = 1.5 * (1 - 0.5 * Math.max(this._offsetIndex - this._centerSpiralCount, 0) / this._sidePanelCount) / Math.sqrt(this._offsetIndex);
    },

    animate: function()
    {
	console.log("SRK: HELLO 3 ");
        for (var i = 0; i < this._offsetIndex; ++i) {
            var tile = this.tiles[i];
            tile.active = true;
            tile.element.style[tile.visibleCSS[0]] = tile.visibleCSS[2];
        }

        for (var i = this._offsetIndex; i < this.tiles.length && this.tiles[i].active; ++i) {
            var tile = this.tiles[i];
            tile.active = false;
            tile.element.style[tile.visibleCSS[0]] = tile.visibleCSS[1];
        }
    }
});

var MultiplyVariantBenchmark = Utilities.createSubclass(Benchmark,
    function(options)
    {
        Benchmark.call(this, new MultiplyVariantStage(), options);
    }
);

window.benchmarkClass = MultiplyVariantBenchmark;

}());
