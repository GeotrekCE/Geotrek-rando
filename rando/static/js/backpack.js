/**
 * @author Yahya
 */
function BackPack()
{
	var self = this;
	var retrievedObject = localStorage.getItem('backPack');
	if(!retrievedObject)
	{
	    self.backPack = [];
	    localStorage.setItem('backPack', JSON.stringify(self.backPack));
	}else
	{
		self.backPack = JSON.parse(retrievedObject);
	}
/************************** Save function *****************************/
	this.save = function (trekid)
	{
		if (!self.contains(trekid))
		{
			self.backPack.push(trekid);
			localStorage.setItem('backPack', JSON.stringify(self.backPack));
		}
		$(window).trigger("backpack:change");
	}
/*************************** Remove function *************************/
	this.remove = function(trekid)
	{
		if (self.contains(trekid)) {
			var pos = self.backPack.indexOf(trekid);
			self.backPack.splice(pos, 1);
		}
		$(window).trigger("backpack:change");
  		localStorage.setItem('backPack', JSON.stringify(self.backPack));
	}
/********************** Check if contains function ********************/
	this.contains = function(trekid)
	{
		return $.inArray(trekid, self.backPack) != -1;
	}

	this.length = function ()
	{
		return self.backPack.length;
	}
}
