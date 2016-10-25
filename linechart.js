
function linechart(csvdata,id,year,seriescode){
    var data = csvdata.filter(function(d){
        return d.CountryCode === id;
    })
    console.log(data);
    if(seriescode==='NY.GDP.MKTP.CD'||seriescode === 'NY.GDP.PCAP.CD'){
        data[0][year] *= 1000000000;
    }
    if(seriescode==='SP.POP.TOTL'||seriescode==='SL.TLF.TOTL.IN'){
        data[0][year] *= 100000;
    }
    
    var linedata = [];
    var tmp = new Object();
    var tmp2 = new Object();
    var tmp3 = new Object();
    var tmp4 = new Object();
    var tmp5 = new Object();
    tmp.date = 2010;
    tmp.val = data[0]['YR2010'];
    linedata.push(tmp);
    tmp2.date = 2011;
    tmp2.val = data[0]['YR2011'];
    linedata.push(tmp2);
    tmp3.date = 2012;
    tmp3.val = data[0]['YR2012'];
    linedata.push(tmp3);
    tmp4.date = 2013;
    tmp4.val = data[0]['YR2013'];
    linedata.push(tmp4);
    tmp5.date = 2014;
    tmp5.val = data[0]['YR2014'];
    linedata.push(tmp5);
    
    

    if(seriescode==='NY.GDP.MKTP.CD'||seriescode === 'NY.GDP.PCAP.CD'){
        data[0][year] /= 1000000000;
        for(var i=0;i<5;i++){
            linedata[i].val /= 1000000000;
        }
        //单位变成10亿美元
    }

    if(seriescode==='SP.POP.TOTL'||seriescode==='SL.TLF.TOTL.IN'){
        data[0][year] /= 100000;
        for(var i=0;i<5;i++){
            linedata[i].val /= 100000;
        }
        //单位变成10万人
    }
    console.log(linedata);
    var maxval=linedata[0].val;
    var minval=linedata[0].val;
    
    for(var i=1;i<5;i++){
        if(linedata[i].val!='..'){
            if(linedata[i].val>maxval) maxval = linedata[i].val;
            if(linedata[i].val<minval) minval = linedata[i].val;
        }
    }

    console.log(maxval);
    console.log(minval);
    var height = 400;
    var width = 500;
    var padding = { left:30, right:30, top:30, bottom:30 };
    var xRangeWidth = width - padding.left - padding.right;
    var yRangeWidth = height - padding.top - padding.bottom;

    var xScale = d3.scale.ordinal()
					.domain([2010,2011,2012,2013,2014])
					.rangeBands([0, xRangeWidth],0);

    var yScale = d3.scale.linear()
					.domain([0.8*minval,1.2*maxval])		//定义域
					.range([10, yRangeWidth]);	//值域

    var cont = d3.select('body')
                .append('svg')
                .attr("width",width)
                .attr("height",height);

    //document.getElementsByClassName('linec').innerHTML = '';
    //querySelector('linec').innerHTML = '';
    var svg = d3.select("#detail")
                .append("svg:svg")//在“container”中插入svg
                .attr("width", width)//设置svg的宽度
                .attr("height", height)//设置svg的高度
                .attr('transform', 'translate(30,30)');
    
     /*var svg = cont.append('g')
                .attr('class','content')
                .attr("width",width)
                .attr("height",height)*/           

    
  
    console.log(linedata);         
    
    var line = d3.svg.line()
			.x( function(d){console.log(xScale(d.date)); return xScale(d.date+1); } )
			.y( function(d){ return yScale(maxval-d.val); } )
			.interpolate("cardinal");

    
    var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom");
		
	yScale.range([yRangeWidth, 0]);
    var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left");
    

    svg.append("g")
			.attr("class","myaxis")
			//.attr("transform",'translate(0,' + height + ')')//(height - padding.bottom)
            .attr("transform","translate(30,350)")
			.call(xAxis);

    svg.append("g")
			.attr("class","myaxis")
			.attr("transform","translate(30,30)")
			//.append('text')
            //.text('次/天')
            .call(yAxis); 
  
    //数据绑定
    var line = d3.svg.line()
                .x(function(d) { return xScale(d.date)+70; })
                .y(function(d) { return yScale(d.val); })
                .interpolate('monotone');
                console.log(linedata);
    var path = svg.append('path')
                .attr('class', 'line')
                .attr('d', line(linedata))
                .attr("stroke","#69b0c8")
                .attr("stroke-width",2)
                .attr("fill","none");

    var g = svg.selectAll('circle')
                .data(linedata)
                .enter()
                .append('g')
                .append('circle')
                .attr('class', 'linecircle')
                .attr('cx', line.x())
                .attr('cy', line.y())
                .attr('r', 3.5)
                .attr("stroke","#69b0c8")
                .attr("stroke-width",2)
                .attr("fill","white")
                .on('mouseover', function() {
                    d3.select(this).transition().duration(500).attr('r', 5);
                })
                .on('mouseout', function() {
                    d3.select(this).transition().duration(500).attr('r', 3.5);
                });
        
}