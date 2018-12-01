var xjs = require('xjs');
var App = new xjs.App();

window.onload = init;

var isXsplit = false;

var xhr = new XMLHttpRequest();

var timestampOld=0;
var timestamp=0;
var cacheBusterValiable=Date.now();
var cacheBuster=0;

var firstupdate = true;

var scObj;

var currPlayer1;
var currPlayer2;

var currScore1;
var currScore2;

var animating = 0;

var switchCount = 0;
var currPlayerElement = "pName";

var isPreview = false;

function init() {
    //アニメーションは、基本init()内部で GSAP の TweenMax を用いて描写。
    xjs.ready().then(xjs.Source.getCurrentSource).then(function(curItem) {
        var sourceWindow = xjs.SourcePluginWindow.getInstance();
        App.getVersion().then(function(res) {
            var version = res;
            console.log(version);
        });
        isXsplit = true;

        XJSitem = curItem;

        XJSitem.setBrowserCustomSize(xjs.Rectangle.fromDimensions(1280,48));
        XJSitem.setPosition(xjs.Rectangle.fromCoordinates(0,0,1,0.0666666666666667));
        XJSitem.setPositionLocked(true);

        XJSitem.getView().then(function(view) {
            console.log("view:" +view);
            if (view != 0) {
                isPreview = true;
            }
        });

        App.getTransition().then(function(res) {
            var currTransition = res._value;
            console.log(currTransition);
            if (currTransition.indexOf(".webm") == -1 ){
                setTimeout(update,300);
            } else {
                var transitionDuration = currTransition.split('.webm,')[1] / 10000 ;
                if (!transitionDuration) {
                    transitionDuration = 2000;
                }
                console.log(transitionDuration);
                setTimeout(update,transitionDuration);
            }
        });
    });


    //TweenMax の引数について： http://qiita.com/ANTON072/items/a1302f4761bf0ffcf525
    TweenMax.to('#board1', 0.3, {
        top:"0px",
        repeat:0,
        ease: Power2.Linear,
        delay: 0,
        yoyo:false
    });
    TweenMax.to('#board2', 0.6, {
        top:"0px",
        repeat:0,
        ease: Power3.Linear,
        delay: 0.1,
        yoyo:false
    });
    TweenMax.to('#board3', 0.8, {
        left:"0px",
        repeat:0,
        ease: Power2.easeOut,
        delay: 0.7,
        yoyo:false
    });
    TweenMax.to('#board4', 0.8, {
        left:"0px",
        repeat:0,
        ease: Power2.easeOut,
        delay: 0.7,
        yoyo:false
    });

    //真下の行は、Xsplit専用の式。Xsplitでhtmlを60fpsとするのに必要。
    //ブラウザで動作チェックする分には、コメントアウトして頂いて問題ナッシング
    if (isXsplit) {
        window.external.SetLocalProperty("prop:Browser60fps","1");
    }

    //以下から普通に必要な式
    xhr.overrideMimeType('application/json');
    
	xhr.onreadystatechange = scLoaded;
	pollHandler();
	setInterval(function() {
		pollHandler();
	}, 500);
}

function pollHandler() {
	xhr.open('GET', "streamcontrol.json?"+cacheBusterValiable+"="+cacheBuster,true);
	xhr.send();
	cacheBuster++;
}

function switchTagTwitter(){
    switch (currPlayerElement) {
        case 'pName':
            if (scObj["pTwitter1"] || scObj["pTwitter2"]) {
                currPlayerElement = 'pTwitter';
            }
            break;
        case 'pTwitter':
            currPlayerElement = 'pName';
            break;
    }
    if (scObj["pTwitter1"] && currPlayerElement == 'pTwitter' || document.getElementById("player1").innerHTML != currPlayer1) {
        TweenMax.to(document.getElementById("player1"),0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
            document.getElementById("player1").innerHTML = scObj[currPlayerElement + "1"].toString().toUpperCase();
            textFit(document.getElementsByClassName('player1'), {minFontSize:14, maxFontSize: 20,multiLine: false});
        }});
        TweenMax.to(document.getElementById("player1"),0.5,{opacity:1,ease:Quad.easeOut,delay:0.5});
    }
    
    if (scObj["pTwitter2"] && currPlayerElement == 'pTwitter' || document.getElementById("player2").innerHTML != currPlayer2) {
        TweenMax.to(document.getElementById("player2"),0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
            document.getElementById("player2").innerHTML = scObj[currPlayerElement + "2"].toString().toUpperCase();
            textFit(document.getElementsByClassName('player2'), {minFontSize:14, maxFontSize: 20,multiLine: false});
        }});
        TweenMax.to(document.getElementById("player2"),0.5,{opacity:1,ease:Quad.easeOut,delay:0.5});
    }
    switchCount = 0;
}

function scLoaded() {
    
	if (xhr.readyState === 4) {
        
		scObj = JSON.parse(xhr.responseText);
        
		timestampOld = timestamp;
		timestamp = scObj["timestamp"];
		//console.log(timestamp);
        if (timestamp != timestampOld && animating == 0 || firstupdate) {
            update();
        } else if(animating == 0 && switchCount > 10) {
            switchTagTwitter();
        } else {
            switchCount++;
        }
	}
}

function update() {
    
	var datetime = new Date();
	var unixTime = Math.round(datetime.getTime()/1000);

	if (firstupdate) {
		animating++;

		document.getElementById("scoreboardintro").play();
        document.getElementById("scoreboardintro").onended = function() {};
        
        currPlayer1 = scObj["pName1"].toString().toUpperCase();
        currPlayer2 = scObj["pName2"].toString().toUpperCase();
            
        document.getElementById("player1").innerHTML = currPlayer1;
        document.getElementById("player2").innerHTML = currPlayer2;

        currScore1 = scObj["pScore1"];
        currScore1 = currScore1 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore1;
        currScore2 = scObj["pScore2"];
        currScore2 = currScore2 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore2;
        currBestOf = scObj["bestOf"];
        document.getElementById("score1").innerHTML = "<img src='imgs/"+ currBestOf +"-"+ currScore1 +".png'>";
        document.getElementById("score2").innerHTML = "<img src='imgs/"+ currBestOf +"-"+ currScore2 +".png'>";

        document.getElementById('stage').innerHTML = scObj['stage'];


        TweenMax.from(document.getElementById("player1"),0.5,{x:"+50",opacity:0,delay:1.5});
        TweenMax.from(document.getElementById("player2"),0.5,{x:"-50",opacity:0,delay:1.5});

        TweenMax.from(document.getElementById("score1"),0.5,{opacity:0,delay:1.5});
        TweenMax.from(document.getElementById("score2"),0.5,{opacity:0,delay:1.5});

        loadFlags();

        TweenMax.from(document.getElementById("flag1"),0.5,{opacity:0,delay:1.5});
        TweenMax.from(document.getElementById("flag2"),0.5,{opacity:0,delay:1.5});

        TweenMax.from(document.getElementById('stage'),0.5,{opacity:0,delay:1.5,onComplete:function(){animating--;}});

        document.getElementById("container").style.display="block";
        textFit(document.getElementsByClassName('stage'), {minFontSize:10, maxFontSize: 14,multiLine: false});

        textFit(document.getElementsByClassName('player1'), {minFontSize:14, maxFontSize: 20,multiLine: false});
        textFit(document.getElementsByClassName('player2'), {minFontSize:14, maxFontSize: 20,multiLine: false});

        firstupdate = false;

    } else if (animating == 0) {

		if (currCountry1 != getCountry(scObj["pCountry1"].toString()) || currCountry2 != getCountry(scObj["pCountry2"].toString())) {
            animating++;
			TweenMax.to(document.getElementById("flags"),1,{opacity:0,onComplete: function() {
				loadFlags();
			}});
			TweenMax.to(document.getElementById("flags"),1,{opacity:1,delay:1,onComplete:function(){animating--;}});
		}

		if (currPlayer1 != scObj["pName1"].toString().toUpperCase() || currPlayer2 != scObj["pName2"].toString().toUpperCase()) {
            animating++;

    		TweenMax.to(document.getElementById("player1"),0.5,{x:"+50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                currPlayer1 = scObj["pName1"].toString().toUpperCase();
                document.getElementById("player1").innerHTML = currPlayer1;
                textFit(document.getElementsByClassName('player1'), {minFontSize:14, maxFontSize: 20,multiLine: false});
            }});
            TweenMax.to(document.getElementById("player1"),0.5,{x:"-0",opacity:1,ease:Quad.easeOut,delay:0.5});

    		TweenMax.to(document.getElementById("player2"),0.5,{x:"-50",opacity:0,ease:Quad.easeIn,onComplete: function() {
                currPlayer2 = scObj["pName2"].toString().toUpperCase();
                document.getElementById("player2").innerHTML = currPlayer2;
                textFit(document.getElementsByClassName('player2'), {minFontSize:14, maxFontSize: 20,multiLine: false});
            }});
            TweenMax.to(document.getElementById("player2"),0.5,{x:"+0",opacity:1,ease:Quad.easeOut,delay:0.5,onComplete:function(){
                animating--;
            }});

            switchCount = 0;
            currPlayerElement = "pName";
    	}

        if (currScore1 != scObj["pScore1"].toString() || currBestOf != scObj["bestOf"]) {
            animating++;
            currScore1 = scObj['pScore1'].toString();
            currScore1 = currScore1 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore1;
            TweenMax.to(document.getElementById('score1'),0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
                document.getElementById("score1").innerHTML = "<img src='imgs/"+ scObj["bestOf"] +"-"+ currScore1 +".png'>";
            }});
            TweenMax.to(document.getElementById('score1'),0.5,{opacity:1,ease:Quad.easeOut,delay:0.5,onComplete: function(){
                animating--;
            }});
        }
        if (currScore2 != scObj["pScore2"].toString() || currBestOf != scObj["bestOf"]) {
            animating++;
            currScore2 = scObj['pScore2'].toString();
            currScore2 = currScore2 > 2 && scObj["bestOf"] == "bo3" ? 2 : currScore2;
            currBestOf = scObj['bestOf'];
            TweenMax.to(document.getElementById('score2'),0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
                document.getElementById("score2").innerHTML = "<img src='imgs/"+ scObj["bestOf"] +"-"+ currScore2 +".png'>";
            }});
            TweenMax.to(document.getElementById('score2'),0.5,{opacity:1,ease:Quad.easeOut,delay:0.5,onComplete: function(){
                animating--;
            }});
        }

        if (document.getElementById('stage').innerHTML != scObj['stage']) {
            animating++;
            TweenMax.to(document.getElementById('stage'),0.5,{opacity:0,ease:Quad.easeIn,onComplete: function() {
                document.getElementById('stage').innerHTML = scObj['stage'];
                textFit(document.getElementsByClassName('stage'), {minFontSize:10, maxFontSize: 14,multiLine: false});
            }});
            TweenMax.to(document.getElementById('stage'),0.5,{opacity:1,delay:0.5,ease:Quad.easeOut,onComplete: function(){
                animating--;
            }});
        }
	}
}

function loadFlags() {

	currCountry1 = getCountry(scObj["pCountry1"].toString());
	currCountry2 = getCountry(scObj["pCountry2"].toString());

	document.getElementById("flag1").src = "GoSquared/expanded/" + currCountry1 + ".png";
	document.getElementById("flag2").src = "GoSquared/expanded/" + currCountry2 + ".png";

}

function getCountry (country) {

	var count = iso.findCountryByName(country);
	if (!count)
		count = iso.findCountryByCode(country);
	if (!count) {
		var count = new Array();
		count['value'] = country;
	}

	return count['value'];
}