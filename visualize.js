window.visualize = (function () {
    svg = null;

	//Width, height and paddings
    var w = 900;
    var h = 500;
    var padding = 40;

    function highlight(eventObj) {
        var cls = eventObj.target.getAttribute("class");
        d3.selectAll("rect." + cls + ', ' + "text." + cls)
            .classed("highlight", true);
    }

    function unhighlight(eventObj) {
        d3.selectAll("rect, text").classed('highlight', false);
    }

    return {
        'createChart': function (dataset, container) {

            var elems = [];
            var weeknum = 1;

            var week_max = null;
            var week_min = null;

            var week_max_value = null;
            var week_min_value = null;

            for (var i = 0; i < dataset.length; i++) {
                var elem = dataset[i];
                var date = elem[0];
                var value = elem[1];
                elems.push({
                    'date': date,
                    'day': date.getDate(),
                    'month': date.getMonth() + 1,
                    'value': value,
                    'weeknum': weeknum,
                });
                if (!week_max) {
                    week_max = i;
                    week_min = i;
                    week_max_value = value;
                    week_min_value = value;
                }
                if (value > week_max_value) {
                    week_max = i;
                    week_max_value = value;
                }
                if (value < week_min_value)
                {
                    week_min = i;
                    week_min_value = value;
                }
                if (date.getDay() === 0) {
                    weeknum += 1;

                    elems[week_min].min = true;
                    elems[week_max].max = true;

                    week_max = null;
                    week_min = null;
                    week_max_value = null;
                    week_min_value = null;
                }
            }

            if (week_min) {
                elems[week_min].min = true;
            }
            if (week_max) {
                elems[week_max].max = true;
            }



            // standardization
            var yAxisScale = d3.scale.linear()
                .domain([0, d3.max(elems, function (d) {
                    return d.value
                })])
                .range([h - padding, padding]);

            var xScale = d3.scale.ordinal()
                .domain(d3.range(elems.length))
                .rangeRoundBands([padding, w - padding / 5]);

            var yScale = d3.scale.linear()
                .domain([0, d3.max(elems, function (d) {
                    return d.value
                })])
                .range([padding, h - padding]);


            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .tickFormat(function (d, i) {
                    return elems[d].day + '.' + elems[d].month;
                })
                .tickSize(5);

            var yAxis = d3.svg.axis()
                .scale(yAxisScale)
                .orient("left")
                .ticks(5);

            //Create SVG element
            svg = d3.select(container)
                .append("svg")
                .attr("width", w)
                .attr("height", h);

            //Create chart
            svg.selectAll("rect")
                .data(elems)
                .enter()
                .append("rect")
                .attr("id", function (d, i) {
                    return i;
                })
                .attr("class", function (d) {
                    return 'week' + d.weeknum;
                })
                .attr("x", function (d, i) {
                    return xScale(i);
                })
                .attr("y", function (d) {
                    return h - yScale(d.value);
                })
                .attr("width", xScale.rangeBand())
                .attr("height", function (d) {
                    return yScale(d.value) - padding;
                })
                .attr("fill", function (d) {
                    return "rgb(0, 0, " + (d.value * 10) + ")";
                })
                .attr("style", "outline: thin solid black;");

            //Create labels
            svg.selectAll("text")
                .data(elems)
                .enter()
                .append("text")
                .text(function (d) {
                    return d.value;
                })
                .attr("text-anchor", "middle")
                .attr("class", function (d) {
                    var cls = 'text week' + d.weeknum;
                    if (d.min) {
                        cls += ' min'
                    }
                    if (d.max) {
                        cls += ' max'
                    }
                    return cls
                })
                .attr("x", function (d, i) {
                    return xScale(i) + xScale.rangeBand() / 2;
                })
                .attr("y", function (d) {
                    return h - yScale(d.value) - 5;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "black")
                .attr("font-weight", "700");

            // Create axis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (h - padding) + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + padding + ",0)")
                .call(yAxis);

            var rects = document.getElementsByTagName("rect");
            for (var i = 0; i < rects.length; i++) {
                rects[i].addEventListener('mouseover', highlight);
                rects[i].addEventListener('mouseleave', unhighlight);
            }

        }
    }
})();