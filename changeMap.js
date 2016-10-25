function changeMap(seriescode,panelID,year){
    d3.csv("countriesData.csv",function(error,csvdata){
        
        if(error){
            console.log(error);
        }
        console.log(year);
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
        if(seriescode==='SP.POP.TOTL.FE.ZS'){
            console.log(seriescode);
            console.log(maxVar);
            console.log(minVar);
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
        var svg = d3.select(panelID).selectAll('svg');
        svg.selectAll('path')
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
            .on("click", function(d){ 
                d3.select("#contain")
                    .append("text")
                    .text(d.properties.name + CSVdata[0].SeriesName + 'in 5 years----------------------------------')
                linechart(CSVdata,d.id,year,seriescode);
            }) 
            .on('mouseout', function(data) {
                tooltip.style("opacity",0.0);
                d3.select(this).attr('fill',  function(d){
                    return color(d.id);
                });
            })
            .attr('fill', function(d){
                return color(d.id);
            });
    });
}