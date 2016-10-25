var m = [60, 40, 40, 80],
    w = 1280 - m[1] - m[3],
    h = 500 - m[0] - m[2];
var x,y={};
var svg = d3.select("body").append("svg")
        .attr("class","parallel")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    foreground;
var tip=d3.tip()
        .attr("class","d3-tip")
        .html(function () {
            var d = arguments[0];
            if(arguments.length >1)
                i = arguments[1];
            else
                i = "";
            if(!isNaN(d))
                return d.toPrecision(6)+"<br>"+i;
            return d+"<br>"+i;
        });
var width = 1000,height = 668;
var ssvg = d3.select("body")
        .insert("svg","svg")
        .call(tip);
var species = ["Country Name","Series Name",
               "Country Code","Series Code"],
    index= ["2010 [YR2010]","2011 [YR2011]",
            "2012 [YR2012]","2013 [YR2013]",
            "2014 [YR2014]"];
var traits = [] ;
var changer = true;
var curcountry = "CHN", value = 0;
d3.csv("data/countriesData.csv", function(datas) {
    for (i = 0; i < 5; i++) {
        datas.pop();
    }
    var countries = [],len = 0;
    countries.push(datas[0][species[2]]);
    datas.forEach(function  (d) {
        if(d[species[2]] != countries[len])
        {
            countries.push(d[species[2]]);
            len ++;
        }
    });

    for( i in datas ) {
        if(datas[i][species[0]]!="China")
            break;
        traits[i] = datas[i][species[3]];
    }

    x = d3.scale.ordinal().domain(traits).rangePoints([0, w]);
    // Create a scale and brush for each trait.
    index.forEach(function(d) {
        // Coerce values to numbers.
        datas.forEach(function(p) {
                p[d] = +p[d];
        });
    });

    var dataset = new Array();
    for( year in index ) {
        dataset[year] = new Array();
        for (i = 0; i < countries.length; i++) {
            dataset[year][i] = {};
            dataset[year][i]["Country Code"]=countries[i];
        }
    }
    traits.forEach(function  (d,inde) {
        for( year in index ) {
            for (i = inde; i < datas.length; i+= 17) {
                dataset[year][parseInt(i/17)][datas[i][species[3]]]=datas[i][index[year]];
            }
        }
    });

    function draw (year) {

        traits.forEach(function  (d,inde) {
            switch (inde) {
            case 1://"NY.GDP.MKTP.CD":
            case 3://"SP.RUR.TOTL":
            case 6://"SP.POP.TOTL"
            case 8:
            case 9://"SL.TLF.TOTL.IN":
            case 12://"AG.SRF.TOTL.K2":
            case 13:
                y[d] = d3.scale.log()
                    //.base(Math.E)
                    .domain(d3.extent(dataset[year], function(p) {
                        if(isNaN(p[d])|| p[d] == 0)
                            return 1;
                        else 
                            return p[d];
                    }));
                break;
            default:
                y[d] = d3.scale.linear()
                    .domain(d3.extent(dataset[year], function(p) {
                        if(isNaN(p[d]))
                            return 0;
                        else
                            return p[d];
                    }));
                break;
            }
            
            y[d].range([h, 0]);
            y[d].brush = d3.svg.brush()
                .y(y[d])
                .on("brush", brush);
        });
        // Add foreground lines.
        foreground = svg.append("svg:g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(dataset[year])
            .enter().append("svg:path")
            .attr("d", path)
            .attr("class", function(d) {return d[species[2]]; });
        // Add a group element for each trait.
        var g = svg.selectAll(".trait")
                .data(traits)
                .enter().append("svg:g")
                .attr("class", "trait")
                .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
                .call(d3.behavior.drag()
                    .origin(function(d) { return {x: x(d)}; })
                    .on("dragstart", dragstart)
                    .on("drag", drag)
                    .on("dragend", dragend));
            // Add an axis and title.
        g.append("svg:g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
            .append("svg:text")
            .attr("text-anchor", "middle")
            .attr("y", function (d,i) {
                switch (i%3) {
                case 0:
                    return -45;
                    break;
                case 1:
                    return -30;
                default:
                    return -15;
                    break;
                }
            })
            .text(String);

        // Add a brush for each axis.
        g.append("svg:g")
            .attr("class", "brush")
            .each(function(d) { d3.select(this).call(y[d].brush); })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    }

    function dragstart(d) {
        i = traits.indexOf(d);
    }

    function drag(d) {
        x.range()[i] = d3.event.x;
        traits.sort(function(a, b) { return x(a) - x(b); });
        g.attr("transform", function(d) { return "translate(" + x(d) + ")"; });
        foreground.attr("d", path);
    }

    function dragend(d) {
        x.domain(traits).rangePoints([0, w]);
        var t = d3.transition().duration(500);
        t.selectAll(".trait").attr("transform", function(d) { return "translate(" + x(d) + ")"; });
        t.selectAll(".foreground path").attr("d", path);
    }
    // Returns the path for a given data point.
    function path(d) {
        return line(traits.map(function(p) { return [x(p), y[p](d[p])]; }));
    }
    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = traits.filter(function(p) { return !y[p].brush.empty(); }),
            extents = actives.map(function(p) { return y[p].brush.extent(); });
 
        foreground.classed("fade", function(d) {
            return !actives.every(function(p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            });
        });
        var sele = d3.select(".foreground").selectAll("path");
        
        sele[0].forEach(function   (d,i) {
            if(!d.getAttribute("class").match("fade"))
                d3.select("#"+d.getAttribute("class")).attr("fill","rgba(18,125,139,0.61)");
            else
                d3.select("#"+d.getAttribute("class").substring(0,3)).attr("fill","rgba(128,125,139,0.21)");
        });
    }
    draw(0);

    var rsvg= [];
    var rwidth = 300,rheight=180;
    var pd=[20,20,20,20];
    d3.select("body")
        .insert("div",".parallel");
    var title = d3.select("div")
            .append("select")
            .on("change",function  () {
                drawrect(curcountry,document.getElementsByTagName("select")[0].selectedIndex);
               });
    title.append("option").html("GDP");
    title.append("option").html("人口");
    title.append("option").html("劳动力");
    title.append("option").html("国土");
    title.append("option").html("失业率/上网率");
    var cty = d3.select("div").append("p");
    var clos = d3.select("div")
            .append("button")
            .on("click",function  () {
                changer = true;
                this.setAttribute("style","display:none");
            })
            .html('✖');

    for (i = 0; i < 2; i++) {
        rsvg[i] = d3.select("div")
            .append("svg")
            .attr("class","rect"+i)
            .attr("width",rwidth)
            .attr("height",rheight)
            .call(tip);
    }
    var color = d3.scale.category10();
    function drawrect () {
        var country = arguments[0],sp;
        if(arguments.length >1)
            sp = arguments[1];
        else
            sp = 0;
        if(sp <0)
            return;
        var ct= -1;
        for(i in dataset[0])
        {
            if(dataset[0][i]["Country Code"] == country)
            {
                ct = i;
                console.log(ct);
                break;
            }
        }
        if(ct == -1)
        {
            console.log(ct);
            return ;
        }
        var data = {};
        traits.forEach(function (d,i) {
            data[d] =[];
            for( i in dataset ) {
                data[d][i] = dataset[i][ct][d];
            }
        });
        var ord=[],subtitle=[],oth=[-1,-1];
        switch (sp) {
        case 0: //GDP
            ord[0] = 1;ord[1]=8;
            oth[0] = 0;oth[1] = 7;
            subtitle[0] = '总额(美元)',subtitle[1] = '人均(美元)';
            break;
        case 1: //Pop
            ord[0] = 6;ord[1] = 3;
            oth[0] = 4;
            subtitle[0] = '总数',subtitle[1] = '农村人口';
            break;
        case 2:// lab
            ord[0] = 9;ord[1] = 11;
            oth[0] = 10;
            subtitle[0] = '总数',subtitle[1] = '武装人员(%)';
            break;
        case 3: // border
            ord[0] = 12;ord[1] = 13;
            oth[0] = 14;
            subtitle[0] = '总面积(平方千米)',subtitle[1] = '人口密度(每公里土地面积人数)';
            break;
        case 4: // unem
            ord[0] = 15;ord[1] = 2;
            oth[0]= 16;
            subtitle[0] = '失业人数(%)';subtitle[1] = '互联网用户(每百人)';
            break;
        default:
            break;
        }
        d3.selectAll(".rect").remove();
        for (index = 0; index < 2; index++) {
            
            var usedata=data[traits[ord[index]]];
            var xScale = d3.scale.ordinal()
                    .domain(d3.range(usedata.length))
                    .rangeRoundBands([0,rwidth-80]);
            var yScale = d3.scale.linear()
                    .domain([0,d3.max(usedata)])
                    .range([rheight-2*pd[0],0]).nice();
            var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5);
            var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .ticks(4,"e")
                    .orient("right");
            var enterRect = rsvg[index].selectAll(".rect")
                    .data(usedata).enter();
            enterRect.append("rect")
                .attr("class",function  (d,i) {
                    return "rect";
                })
                .attr("fill","grey")
                .attr("x",function  (d,i) {
                    return xScale(i)+pd[0]/2;
                })
                .attr("y",function  (d,i) {
                    return yScale(d)+pd[0];
                })
                .attr("width",25)
                .attr("height",function  (d) {
                    return rheight-2*pd[2]-yScale(d);
                })
                .on("mouseover",function  (d,i) {
                    var ii = this.parentNode.getAttribute("class");
                    if(ii == "rect0")
                        ii = 0;
                    else ii = 1;
                   switch (oth[ii]) {
                   case 0:case 7:
                       ii = "增长率:"+data[traits[oth[ii]]][i].toPrecision(4)+"%";
                       break;
                   case 4:case 10: case 16:
                       ii = "女性:"+data[traits[oth[ii]]][i].toPrecision(4)+"%";
                       break;
                   case 14:
                       ii = "耕地面积:"+data[traits[oth[ii]]][i].toPrecision(4)+"%";
                       break;
                   default:
                       tip.show(d);
                       return ;
                   }
                    tip.show(d,ii);
                })
                .on("mouseout",function  (d) {
                    tip.hide();
                });
            rsvg[index].selectAll("g").remove();
            rsvg[index].append("g")
                .attr("class","xaxis")
                .attr("transform","translate("+0 +","+(rheight-pd[2])+")")
                .call(xAxis);
            rsvg[index].append("g")
                .attr("class","xaxis")
                .attr("transform","translate("+0+","+pd[0]+")")
                .call(yAxis)
                .append("text")
                .attr("y",-10)
                .text(subtitle[index]);
        }
    }
    
    d3.json("data/world-countries.json",function  (data) {
        
        var projection = d3.geo.mercator();
        var oldScala = projection.scale();
        var oldTranslate = projection.translate();
        var xy = projection.scale(oldScala*(width/oldTranslate[0]/2)*0.9)
                .translate([width/2,height*2/3]);
        var path = d3.geo.path().projection(xy);
       
        ssvg.attr("width",width).attr("height",height);
        ssvg.selectAll("path")
            .data(data.features)
            .enter()
            .append("svg:path")
            .filter(function  (d) {
                return d.properties.name!="Antarctica";
            })
            .attr("d",path)
            .attr("id",function  (d) {
                return d.id;
            })
            .attr("fill","rgba(128,124,139,0.61)")
            .attr("stroke","rgba(255,255,255,1)")
            .attr("stroke-width",1)
            .on("mouseover",function  (data) {
                d3.select(this).attr("fill","rgba(2,2,139,0.61)");
                value = document.getElementsByTagName("select")[0].selectedIndex;
                tip.show(data.properties.name);
                if(changer)
                {
                    cty.html(data.properties.name);
                    drawrect(data.id,value);
                }
            })
            .on("click",function (data) {
                curcountry = data.id;
                cty.html(data.properties.name);
                changer = false;
                drawrect(data.id,value);
                clos.attr("style","display:block");
            })
            .on("mouseout",function  (data) {
                d3.select(this).attr("fill","rgba(128,125,139,0.61)");
                tip.hide();
            });
    }); 
});