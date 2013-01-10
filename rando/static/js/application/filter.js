// JavaScript Document
function storage()
{
	
	var self = this;
	var retrievedObject = localStorage.getItem('storeObject');
	var retrievedObjectSlider = localStorage.getItem('storeSlider');
	if((!retrievedObject)||(!retrievedObjectSlider))
	{
		this.state = {"theme":{"cols":"0","sommet":"0","refug":"0","flore":"0","faune":"0","patr":"0","lacs":"0"},
					  "usage":{"velo":"0","vtt":"0","cheval":"0"},
					  "valle":{"Brianconnais":"0","Champsaur":"0","Embrunais":"0","Oisans":"0","Valbonnais":"0","vallouise":"0","Valgaudemar":"0"},
					  "access":{"f":"0","p":"0"},
					  "trans":{"trans":"0"},"boucle":{"boucle":"0"}
					  };
		this.sliderState = {"stage":{"min":"0","max":"0"},
							"time":{"min":"0","max":"0"},
							"den":{"min":"0","max":"0"}
					  };
		localStorage.setItem('storeObject', JSON.stringify(self.state));
		localStorage.setItem('storeSlider',JSON.stringify(self.sliderState));
	}
	else 
	{
		this.state = JSON.parse(retrievedObject);
		this.sliderState = JSON.parse(retrievedObjectSlider);
	}


	this.ChangeStateTheme = function ()
		{
			$(".theme .btn, .vallee .btn, .access .btn, .usage .btn").on('click',self.save);
			$(".trans input, .boucle input").on('click',self.save);
			$('#search').on("change", self.save);
			self.loadFilter();
		}	
	
/***************** Function To save Slider state*********************/
	this.SaveSlider = function(minVal,maxVal,e)
	{
		self.sliderState[e]["min"] = minVal;
		self.sliderState[e]["max"] = maxVal;
		localStorage.setItem('storeSlider', JSON.stringify(self.sliderState));
	}
/*****************Function To save Filter***************************/
	this.save = function ()
	{
		var filtre =$(this).data("filter");
		var Elem = $(this).attr("id");
		if( $(this)[0].nodeName.toLowerCase() === 'input' ) 
		{
			if( $(this)[0].checked)
			{
				self.state[filtre][Elem] = "1";
			}else
			{
				self.state[filtre][Elem] = "0";
			}
		}else
		{
		
			if ($(this).hasClass("active"))
			{
				self.state[filtre][Elem] = "0";
			}else{
				self.state[filtre][Elem] = "1";
			}
		}
		localStorage.setItem('storeObject', JSON.stringify(self.state));
		$(self).trigger("filterchange");
	}
/****************Function To load Filter*************************/
	this.loadFilter = function()
	{
		var retrievedObject = localStorage.getItem('storeObject');
		var myObject = JSON.parse(retrievedObject);	
		for(key in myObject){
			for (i in myObject[key])
			{
				if (myObject[key][i]== 1)
				{
					
					if($('#'+i).is("input"))
					{
						$('#'+i).attr('checked', true);

					}
					$('#'+i).addClass('active');
					
				}
			}
		}
	}
/****************Function To load Slider*****************************/	
	this.loadSlider = function()
	{
		var retrievedObjectSlider = localStorage.getItem('storeSlider');
		var myObjectSlider = JSON.parse(retrievedObjectSlider);
		$( "#stage" ).slider( "values", 0, myObjectSlider.stage.min);
		$( "#stage" ).slider( "values", 1, myObjectSlider.stage.max);
		for(keySlider in myObjectSlider){
			$( "#"+keySlider ).slider( "values", 0, myObjectSlider[keySlider]["min"]);
			$( "#"+keySlider ).slider( "values", 1, myObjectSlider[keySlider]["max"]);
		}
	}
	
	
/********************* Match Stage ***********************************/
	this.matchStage = function (trek)
	{
		var minStage = this.sliderState.stage.min;
		var maxStage = this.sliderState.stage.max;
		
		var trekDifficulty = trek.properties.serializable_difficulty.id;
		if  (!trekDifficulty) return true;
		return trekDifficulty >= minStage && trekDifficulty <= maxStage;
	}
/*********************** Match Theme *********************************/	
	this.matchTheme = function (trek)
	{	
		var themeArray = [];
		
		for (i in this.state.theme)
		{
			if (this.state.theme[i] == "1")
			{
				themeArray.push(i);
				//console.log(themeArray);
			}
		}
		for (key in trek.properties.serializable_themes)
				{
					if($.inArray (trek.properties.serializable_themes[key].label,themeArray) != -1)
						{
							return true;
						}
				}
	}
/**************** Function Match Usage ***************************/
	this.matchUsage = function (trek)
	{
		var usageArray = [];
		for (i in this.state.usage)
		{
			if (this.state.usage[i] == "1")
			{
				usageArray.push(i);
			}
		}
		if (usageArray.length == 0)
			return true;
		
		for (key in trek.properties.serializable_usages)
				{
					if($.inArray (trek.properties.serializable_usages[key].label,usageArray) != -1)
						{
							return true;
						}
				}
				
		return false;
	}
/**************** Function Match Valle ***************************/
	this.matchDistrict = function (trek)
	{
		var valleArray = [];
		
		for (i in this.state.valle)
		{
			if (this.state.valle[i] == "1")
			{
				valleArray.push(i);
			}
		}
		for (key in trek.properties.serializable_districts)
				{
					if($.inArray (trek.properties.serializable_districts[key].name,valleArray) != -1)
						{
							return true;
						}
				}
	}
/**************** Function Match Boucle ***************************/
	this.matchLoop = function (trek)
	{
		return (trek.properties.is_loop == (this.state.boucle  == "1"));
	}

/**************** Function Match Duration ***************************/
	this.matchDuration = function (trek)
	{
		var minDuration = this.sliderState.time.min;
		var maxDuration = this.sliderState.time.max;
		var matching = {
			5:12,
			10:24,
			15:48,
			};
		var trekDuration = trek.properties.duration;
		if (minDuration == 0)
		{
			if (maxDuration== 20)
			{	
				return true;
			}
			if (maxDuration== 0)
			{
				return trekDuration <= 12;
			} 
			return trekDuration <= matching[maxDuration];
		}
			
			if (minDuration== 20)
			{
				return trekDuration >= 48;  
			} 
			if (maxDuration== 20)
			{
				return trekDuration >= matching[minDuration];
			}
			return trekDuration >= matching[minDuration] && trekDuration <= matching[maxDuration];
		
		
	}
	
/************************Funcction Search ************************/
	this.search = function (trek) {
		var searched = $('#search').val();
			for (i in trek.properties.serializable_districts)
			{
				if (trek.properties.serializable_districts[i].name.toUpperCase().indexOf(searched.toUpperCase())!= -1)
				return true;
			}
			if ((trek.properties.name.toUpperCase().indexOf(searched.toUpperCase())!= -1) || 
			   (trek.properties.departure.toUpperCase().indexOf(searched.toUpperCase())!= -1) ||
			   (trek.properties.arrival.toUpperCase().indexOf(searched.toUpperCase())!= -1)) {
				return true;
			}
			return false;
		}

/****************Function to Match filters **************************/
	
	this.match = function(trek)
	{
		if (this.matchStage(trek) && 
			this.matchTheme(trek) &&
			this.matchDuration(trek) &&
			this.matchUsage(trek) &&
			this.matchLoop(trek)&&
			this.matchDistrict(trek) &&
			this.search(trek)
			)
		 	return true;
		return false;
		
	}
};