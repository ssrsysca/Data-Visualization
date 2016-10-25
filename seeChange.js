function seeChange(seriescode,panelID){
    setTimeout(function(){
        changeMap(seriescode,panelID,"YR2010");
        setTimeout(function(){
            changeMap(seriescode,panelID,"YR2011");
            setTimeout(function(){
                changeMap(seriescode,panelID,"YR2012");
                setTimeout(function(){
                    changeMap(seriescode,panelID,"YR2013");
                    setTimeout(function(){
                        changeMap(seriescode,panelID,"YR2014");
                    },1000);
                },1000);
            },1000);
        },1000);
    },1000);
    
}