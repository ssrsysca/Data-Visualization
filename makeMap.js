function makeMap(seriescode,panelID,year){
    	
            
            var height = window.innerHeight;
            var width = window.innerWidth;
            var svg = d3.select(panelID).append('svg');

            d3.json("world-countries.json", function(data) {
            /* Antarctica will not shown on the map */
            var features = _.filter(data.features, function(value, key) {
                return value.properties.name != 'Antarctica';
            });
                d3.csv("countriesData.csv",function(error,csvdata){
                    //console.log(data);
                    if(error){
                        console.log(error);
                    }
                    

                    var CSVdata = csvdata.filter(function(d) {
                        return d.SeriesCode === seriescode;
                    });

                    if(seriescode==='NY.GDP.MKTP.CD'||seriescode === 'NY.GDP.PCAP.CD'){
                        for(var i=0;i<CSVdata.length;i++){
                            if(CSVdata[i][year] !='..')
                            CSVdata[i][year] /= 1000000000;
                        }//单位变成10亿美元
                        
                    }

                    if(seriescode==='SP.POP.TOTL'||seriescode==='SL.TLF.TOTL.IN'){
                        for(var i=0;i<CSVdata.length;i++){
                            if(CSVdata[i][year] !='..')
                            CSVdata[i][year] /= 100000;
                        }//单位变成万人
                        //console.log(CSVdata);
                    }
                    
                    var maxVar = CSVdata[0][year];
                    var minVar = CSVdata[0][year];
                    for(var i=1;i<CSVdata.length;i++){
                        if(CSVdata[i][year]!=".."){
                            
                            if(CSVdata[i][year]>maxVar) maxVar = CSVdata[i][year];
                            if(CSVdata[i][year]<minVar) minVar = CSVdata[i][year];
                        }
                    }
                    
                    
                    var a = d3.rgb(219,236,242);
                    var b = d3.rgb(18,185,241);
                    var c = d3.rgb(1,101,183);
                    var compute = d3.interpolate(a,b);
                    var linear = d3.scale.linear()
                                    .domain([minVar,maxVar])
                                    .range([0,1]);
                    
                    var color = function(id){
                        
                        var i=1;
                        for(i=0;i<CSVdata.length;i++){
                            if(CSVdata[i].CountryCode === id){
                                if(CSVdata[i][year] === "..") return d3.rgb(137,137,137);
                                else {
                                    return compute(linear(CSVdata[i][year]));
                                }
                            }
                            }
                            return d3.rgb(137,137,137);
                        
                        
                    }

                    var projection = d3.geo.mercator();
                    var oldScala = projection.scale();
                    var oldTranslate = projection.translate();

                    xy = projection.scale(oldScala * (width / oldTranslate[0] / 2) * 0.9)
                        .translate([width / 2, height / 2]);
                    
                    path = d3.geo.path().projection(xy);

                    var tooltip = d3.select("body")
                                    .append("div")
                                    .attr("class","tooltip")
                                    .style("opacity",0.0);

                    var csvdat = function(d){
                        
                        for(i=0;i<CSVdata.length;i++){
                            if(CSVdata[i].CountryCode === d.id){
                                
                                return CSVdata[i][year];
                            }
                        }
                        return 'undefined';
                    }


                    svg.attr('width', width).attr('height', height);
                    svg.selectAll('path').data(features).enter().append('svg:path')
                        .attr('d', path)
                        .on('mouseover', function(data) {
                        d3.select(this).attr('fill', 'rgba(239,182,97,0.9)');
                        
                        tooltip.html(data.properties.name +' '+ CSVdata[0].SeriesName +' in '+year+': '+csvdat(data) )
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY + 20) + "px")
                                .style("opacity",1.0);                                                      
                        })
                        .on("mousemove",function(d){
                            /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */
                            
                            tooltip.style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY + 20) + "px");
                        })                                                                                  
                        .on('mouseout', function(data) {
                            tooltip.style("opacity",0.0);
                        d3.select(this).attr('fill',  function(d){
                            return color(d.id);
                        });
                        })
                        .on("click", function(d){  
                            d3.select("#contain")
                            .append("text")
                            .text(d.properties.name + CSVdata[0].SeriesName + 'in 5 years----------------------------------')
                           
                            linechart(CSVdata,d.id,year,seriescode);
                                
                        }) 
                        .attr('fill', function(d){
                            return color(d.id);
                        })
                        .attr('stroke', 'rgba(255,255,255,1)')
                        .attr('stroke-width', 1);
                });
            
            });

}
