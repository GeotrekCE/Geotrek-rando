/**
 * @author Yahya
 */
function BackPack()
{
	var self = this;
	var retrievedObject = localStorage.getItem('testObject');
	if(!retrievedObject)
	{
	    self.backPack = [];
	    localStorage.setItem('testObject', JSON.stringify(self.backPack));
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
			localStorage.setItem('testObject', JSON.stringify(self.backPack));
		}
		// Rha! Why this does not work ???
		$(self).trigger("backpack-change");
		$('body').trigger("backpack-change");
	}
/*************************** Remove function *************************/
	this.remove = function(trekid)
	{
		if (self.contains(trekid)) {
			var pos = self.backPack.indexOf(trekid);
			self.backPack.splice(pos, 1);
		}
		// Rha! Why this does not work ???
		$(self).trigger("backpack-change");
		$('body').trigger("backpack-change");
  		localStorage.setItem('testObject', JSON.stringify(self.backPack));
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
