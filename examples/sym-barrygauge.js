(function (CS) {
    var defintion = {
        typeName: 'barrygauge',
        datasourceBehavior: CS.DatasourceBehaviors.Single,
        getDefaultConfig: function () {
            return {
                DataShape: 'Value',
                Min: 0,
                Max: 100,
                Width: 120,
                Height: 120,
                Size: 120
            };
        },
        configOptions: function () {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        },
        init: init
    };

    function init(scope, elem) {
        //console.log(scope.config.Min, scope.config.Max, scope.config.Size);
        var config = scopeToConfig(scope.config);
        
        var sp = elem.find('#barrygaugeContainer > span')[0];
        var id = "barry_" + Math.random().toString(36).substr(2, 16);
        sp.id = id;
        
        var barrygauge = new Gauge(id, config);
        barrygauge.render();
        
        // save so I can redraw after resize
        var lastVal, lastLabel;
        
    	function onUpdate(data) {
    	    if (data) {
                lastVal = data.Value;
                lastLabel = lastLabel || data.Label; // Label not always set
                barrygauge.redraw(data.Value, data.Label);
            }
    	}
        
        function onResize(width, height) {
            d3.select("#" + id).selectAll("*").remove(); // remove current symbol HTML
            barrygauge.resize(Math.min(width, height)); // custom method added to Gauge
            barrygauge.render();
            barrygauge.redraw(lastVal, lastLabel);
    	}
        
        function onConfigChange() {
            // not working
            //d3.select("#" + id).selectAll("*").remove();
            //config = scopeToConfig(scope.config);         
            //barrygauge.configure(config);
            
            //barrygauge.setminmax(scope.config.Min, scope.config.Max);
            
            //console.log(scope.config.Min, scope.config.Max);
            //barrygauge.config.max = scope.config.Max;
            //var range = barrygauge.config.max - barrygauge.config.min;
            //barrygauge.config.yellowZones = [{ from: barrygauge.config.min + range*0.75, to: barrygauge.config.min + range*0.9 }];
            //barrygauge.config.redZones = [{ from: barrygauge.config.min + range*0.9, to: barrygauge.config.max }];
            
            //barrygauge.render();
            //barrygauge.redraw(lastVal, lastLabel);
    	}
        
        return { dataUpdate: onUpdate, resize: onResize, configChange: onConfigChange };
    }

    CS.symbolCatalog.register(defintion);
    
    function scopeToConfig(scopeConfig)
    {
        console.log(scopeConfig.Min, scopeConfig.Max, scopeConfig.Size);
        var config = 
        {
            size: scopeConfig.Size,
            label: "",
            min: undefined != scopeConfig.Min ? scopeConfig.Min : 0,
            max: undefined != scopeConfig.Max ? scopeConfig.Max : 100,
            minorTicks: 5
        }
				
        var range = config.max - config.min;
        config.yellowZones = [{ from: config.min + range*0.75, to: config.min + range*0.9 }];
        config.redZones = [{ from: config.min + range*0.9, to: config.max }];
        
        return config;     
    }
    
    // http://bl.ocks.org/tomerd/1499279
    function Gauge(placeholderName, configuration)
    {
        this.placeholderName = placeholderName;
        
        var self = this; // for internal d3 functions
        
        //custom
        this.resize = function(size)
        {
            this.config.size = size; 
            this.config.raduis = size * 0.97 / 2;
            this.config.cx = size / 2;
            this.config.cy = size / 2;
        }
        
        this.setminmax = function(min, max)
        {
            this.config.min = min;
            this.config.max = max;
            this.config.range = this.config.max - this.config.min;
            this.config.yellowZones = [{ from: this.config.min + this.config.range*0.75, to: this.config.min + this.config.range*0.9 }];
            this.config.redZones = [{ from: this.config.min + this.config.range*0.9, to: this.config.max }];
        }
        
        this.configure = function(configuration)
        {
            this.config = configuration;
            
            this.config.size = this.config.size * 0.9;
            
            this.config.raduis = this.config.size * 0.97 / 2;
            this.config.cx = this.config.size / 2;
            this.config.cy = this.config.size / 2;
            
            this.config.min = undefined != configuration.min ? configuration.min : 0; 
            this.config.max = undefined != configuration.max ? configuration.max : 100; 
            this.config.range = this.config.max - this.config.min;
            
            this.config.majorTicks = configuration.majorTicks || 5;
            this.config.minorTicks = configuration.minorTicks || 2;
            
            this.config.greenColor 	= configuration.greenColor || "#109618";
            this.config.yellowColor = configuration.yellowColor || "#FF9900";
            this.config.redColor 	= configuration.redColor || "#DC3912";
            
            this.config.transitionDuration = configuration.transitionDuration || 500;
        }

        this.render = function()
        {
            this.body = d3.select("#" + this.placeholderName)
                                .append("svg:svg")
                                .attr("class", "gauge")
                                .attr("width", this.config.size)
                                .attr("height", this.config.size);
            
            this.body.append("svg:circle")
                        .attr("cx", this.config.cx)
                        .attr("cy", this.config.cy)
                        .attr("r", this.config.raduis)
                        .style("fill", "#ccc")
                        .style("stroke", "#000")
                        .style("stroke-width", "0.5px");
                        
            this.body.append("svg:circle")
                        .attr("cx", this.config.cx)
                        .attr("cy", this.config.cy)
                        .attr("r", 0.9 * this.config.raduis)
                        .style("fill", "#fff")
                        .style("stroke", "#e0e0e0")
                        .style("stroke-width", "2px");
                        
            for (var index in this.config.greenZones)
            {
                this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor);
            }
            
            for (var index in this.config.yellowZones)
            {
                this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor);
            }
            
            for (var index in this.config.redZones)
            {
                this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor);
            }
            
            if (undefined != this.config.label)
            {
                var fontSize = Math.round(this.config.size / 9);
                this.body.append("svg:text")
                            .attr("class", "labelContainer") // custom. makes this element easier to select when I need to show data.Label on redraw
                            .attr("x", this.config.cx)
                            .attr("y", this.config.cy / 2 + fontSize / 2)
                            .attr("dy", fontSize / 2)
                            .attr("text-anchor", "middle")
                            .text(this.config.label)
                            .style("font-size", fontSize + "px")
                            .style("fill", "#333")
                            .style("stroke-width", "0px");
            }
            
            var fontSize = Math.round(this.config.size / 16);
            var majorDelta = this.config.range / (this.config.majorTicks - 1);
            for (var major = this.config.min; major <= this.config.max; major += majorDelta)
            {
                var minorDelta = majorDelta / this.config.minorTicks;
                for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, this.config.max); minor += minorDelta)
                {
                    var point1 = this.valueToPoint(minor, 0.75);
                    var point2 = this.valueToPoint(minor, 0.85);
                    
                    this.body.append("svg:line")
                                .attr("x1", point1.x)
                                .attr("y1", point1.y)
                                .attr("x2", point2.x)
                                .attr("y2", point2.y)
                                .style("stroke", "#666")
                                .style("stroke-width", "1px");
                }
                
                var point1 = this.valueToPoint(major, 0.7);
                var point2 = this.valueToPoint(major, 0.85);	
                
                this.body.append("svg:line")
                            .attr("x1", point1.x)
                            .attr("y1", point1.y)
                            .attr("x2", point2.x)
                            .attr("y2", point2.y)
                            .style("stroke", "#333")
                            .style("stroke-width", "2px");
                
                if (major == this.config.min || major == this.config.max)
                {
                    var point = this.valueToPoint(major, 0.63);
                    
                    this.body.append("svg:text")
                                .attr("x", point.x)
                                .attr("y", point.y)
                                .attr("dy", fontSize / 3)
                                .attr("text-anchor", major == this.config.min ? "start" : "end")
                                .text(major)
                                .style("font-size", fontSize + "px")
                                .style("fill", "#333")
                                .style("stroke-width", "0px");
                }
            }
            
            var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");
            
            var midValue = (this.config.min + this.config.max) / 2;
            
            var pointerPath = this.buildPointerPath(midValue);
            
            var pointerLine = d3.svg.line()
                                        .x(function(d) { return d.x })
                                        .y(function(d) { return d.y })
                                        .interpolate("basis");
            
            pointerContainer.selectAll("path")
                                .data([pointerPath])
                                .enter()
                                    .append("svg:path")
                                        .attr("d", pointerLine)
                                        .style("fill", "#dc3912")
                                        .style("stroke", "#c63310")
                                        .style("fill-opacity", 0.7)
                        
            pointerContainer.append("svg:circle")
                                .attr("cx", this.config.cx)
                                .attr("cy", this.config.cy)
                                .attr("r", 0.12 * this.config.raduis)
                                .style("fill", "#4684EE")
                                .style("stroke", "#666")
                                .style("opacity", 1);
            
            var fontSize = Math.round(this.config.size / 10);
            pointerContainer.selectAll("text")
                                .data([midValue])
                                .enter()
                                    .append("svg:text")
                                        .attr("x", this.config.cx)
                                        .attr("y", this.config.size - this.config.cy / 4 - fontSize)
                                        .attr("dy", fontSize / 2)
                                        .attr("text-anchor", "middle")
                                        .style("font-size", fontSize + "px")
                                        .style("fill", "#000")
                                        .style("stroke-width", "0px");
            
            this.redraw(this.config.min, 0);
        }
        
        this.buildPointerPath = function(value)
        {
            var delta = this.config.range / 13;
            
            var head = valueToPoint(value, 0.85);
            var head1 = valueToPoint(value - delta, 0.12);
            var head2 = valueToPoint(value + delta, 0.12);
            
            var tailValue = value - (this.config.range * (1/(270/360)) / 2);
            var tail = valueToPoint(tailValue, 0.28);
            var tail1 = valueToPoint(tailValue - delta, 0.12);
            var tail2 = valueToPoint(tailValue + delta, 0.12);
            
            return [head, head1, tail2, tail, tail1, head2, head];
            
            function valueToPoint(value, factor)
            {
                var point = self.valueToPoint(value, factor);
                point.x -= self.config.cx;
                point.y -= self.config.cy;
                return point;
            }
        }
        
        this.drawBand = function(start, end, color)
        {
            if (0 >= end - start) return;
            
            this.body.append("svg:path")
                        .style("fill", color)
                        .attr("d", d3.svg.arc()
                            .startAngle(this.valueToRadians(start))
                            .endAngle(this.valueToRadians(end))
                            .innerRadius(0.65 * this.config.raduis)
                            .outerRadius(0.85 * this.config.raduis))
                        .attr("transform", function() { return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)" });
        }
        
        this.redraw = function(value, label, transitionDuration)
        {
            // custom
            if (label) // not always set. see comment in line 100 coresight.svggauge-model.js
            {
                this.body.select(".labelContainer").text(label);
            }    
            // end custom
            
            var pointerContainer = this.body.select(".pointerContainer");
            
            pointerContainer.selectAll("text").text(Math.round(value));
            
            var pointer = pointerContainer.selectAll("path");
            pointer.transition()
                        .duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
                        //.delay(0)
                        //.ease("linear")
                        //.attr("transform", function(d) 
                        .attrTween("transform", function()
                        {
                            var pointerValue = value;
                            if (value > self.config.max) pointerValue = self.config.max + 0.02*self.config.range;
                            else if (value < self.config.min) pointerValue = self.config.min - 0.02*self.config.range;
                            var targetRotation = (self.valueToDegrees(pointerValue) - 90);
                            var currentRotation = self._currentRotation || targetRotation;
                            self._currentRotation = targetRotation;
                            
                            return function(step) 
                            {
                                var rotation = currentRotation + (targetRotation-currentRotation)*step;
                                return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")"; 
                            }
                        });
        }
        
        this.valueToDegrees = function(value)
        {
            // thanks @closealert
            //return value / this.config.range * 270 - 45;
            return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
        }
        
        this.valueToRadians = function(value)
        {
            return this.valueToDegrees(value) * Math.PI / 180;
        }
        
        this.valueToPoint = function(value, factor)
        {
            return { 	x: this.config.cx - this.config.raduis * factor * Math.cos(this.valueToRadians(value)),
                        y: this.config.cy - this.config.raduis * factor * Math.sin(this.valueToRadians(value)) 		};
        }
        
        // initialization
        this.configure(configuration);	
    }   
    
})(window.Coresight);
