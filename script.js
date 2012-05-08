/*
Developed by Simon de la Rouviere.
Music I listened to while coding this: Mainly Jack White and Peter Gabriel
*/

Array.prototype.indexOf = function(obj, start) {
     for (var i = (start || 0), j = this.length; i < j; i++) {
         if (this[i] === obj) { return i; }
     }
     return -1;
} //IE support

//example input
var time_input = [
	{"start":"9:30","end":"11:00"},
	{"start":"10:30","end":"12:00"},
	{"start":"11:00","end":"17:20"},
	{"start":"11:30","end":"13:00"},
	{"start":"14:00","end":"16:00"}];

/*
Replace json_input with the json array of your choice.
*/
json_input = time_input;

//take output and print it out
$(document).ready(function()
{
	//time
	//layout of time on the side
	var start_time = 9;
	var end_time = 21;

	$("#time_box").css({"height":(end_time-start_time)*60});
	$("#main").css({"height":(end_time-start_time)*60});

	var offset = -10; //offset in pixels so text is at the middle of the point, not just below it.
	for(var i=0; i<=(end_time-start_time)*2; i++)
	{
		var hour = start_time+i/2;
		var am_pm = "<span class='am_pm_text'>AM</span>";

		if(Math.floor(hour) > 12) //pm
		{
			hour -= 12;
			am_pm = "<span class='am_pm_text'>PM</span>";
		}

		if(i%2==0) //Every hour
		{
			$('#time_box').append("<div class='hour_text'>" + hour  + ":00 " + am_pm + "</div>");
		}
		else //every half-hour
		{
			$('#time_box').append("<div class='half_hour_text'>" + Math.floor((hour))  + ":30 </div>");
		}
	}

	//lay out and calibrate the events for the day	
	var events = layOutDay(json_input);

	//add events to page
	for(var i=0;i<events.length;i++)
	{
		$('#main').append("<div id='event_" + i + "'><div class='blue_box'></div><div class='event_details'><span class='event_header'>Sample Item</span> <br /><span class='event_location'> Sample Location</span></div></div>");
		$("#event_"+i).css({
			'position': 'absolute',
			'margin-left' : degree,
			'left': events[i]['left']+10, //+ 10 for padding
			'top': events[i]['top'],
			'height': events[i]['end']-events[i]['start'], 
			'width': events[i]['width'],
			'overflow': 'hidden',
			'background-color': '#ffffff',
			'border': '1px solid #d6d6d6'
		});
	}
});

/*Method:
Degree = how many events in the timeslot. (ie, 2 overlapping events means both events will have a degree of 2)
Position = where in the degree it should be. (1 = most-left)

The function works by aligning events underneath each other at each degree/level.
When all non-clashing events are aligned at that level, it moves to the next level.
When an event is aligned, it is checked against the already aligned events to see if it collides and subsequently adjusts its degree.

Not all events directly collide, so a final recalibration is done to update the degrees so that its width is the same as the events it indirectly and directly collide with.
*/
function layOutDay(events)
{
	//turn times into pixels
	var start_time = 9;
	var end_time = 21;
	for(var x = 0;x<events.length;x++)
	{
		var start_hour = parseInt(events[x]['start'].split(":")[0]);
		var start_minutes = parseInt(events[x]['start'].split(":")[1]);

		var end_hour = parseInt(events[x]['end'].split(":")[0]);
		var end_minutes = parseInt(events[x]['end'].split(":")[1]);

		events[x]['start'] = ((start_hour-start_time)*60)+start_minutes;
		events[x]['end'] = ((end_hour-start_time)*60)+end_minutes;
	}
	

	var iterate_list = events //list to iterate through
	var aligned_list = new Array(); //already aligned
	var unaligned_list = new Array(); //still to align

	iterate_list.sort(function(a,b) { return a.start - b.start }); //sort based on start time

	degree = 1; //all events start out as if they are the only one in that timeslot.

	//iterate through events until all of them have been aligned
	while(iterate_list.length > 0)
	{	
		//go through sorted events based on start time
		for(var i=0;i<iterate_list.length;i++)
		{
			for(var j=i;j<iterate_list.length;j++) //iterate onwards
			{
				//if already in the unaligned list, don't check.
				if(unaligned_list.indexOf(iterate_list[j])!=-1)
				{
					break;
				}

				/*
				First event on that degree/level will always have a left-most position because it has been sorted on start time.(i==j)
				find the first event that has a start time great than initial end time
				*/
				if(iterate_list[j]['start'] > iterate_list[i]['end'] || i==j) 
				{
					if(aligned_list.indexOf(iterate_list[j])==-1)
					{
						//add event to aligned list.	
						iterate_list[j]['degree'] = degree;
						iterate_list[j]['position'] = degree;

						//iterate through aligned list to determine whether to increase the degree of the already aligned events.
						for(var a = 0;a<aligned_list.length;a++)
						{
							if(iterate_list[j]['start'] <= aligned_list[a]['end'] && iterate_list[j]['end'] >= aligned_list[a]['start'])
							{
								aligned_list[a]['degree'] = degree;
							}
						}

						aligned_list.push(iterate_list[j]);
						
						//now continue checking onwards from this event.
						i=j-1
						break;
					}
				}
				else
				{
					//add event to unaligned list.
					unaligned_list.push(iterate_list[j]);
				}
			}
		}

		iterate_list = unaligned_list;
		unaligned_list = new Array();
		degree++; //now start iterating on the level.
	}

	/*
	Final recalibration.
	Some degrees are not properly calibrated because not all events overlap directly.
	Look back at the previous element and if it collides, change degree to match.
	*/
	aligned_list.sort(function(a,b) { return a.start - b.start});
	for(var i=1;i<aligned_list.length;i++)
	{
		if(aligned_list[i]['start'] <= aligned_list[i-1]['end'])
		{
			if(aligned_list[i]['degree'] < aligned_list[i-1]['degree'])
			{
				aligned_list[i]['degree'] = aligned_list[i-1]['degree'];
			}
			else if(aligned_list[i]['degree'] > aligned_list[i-1]['degree'])
			{
				aligned_list[i-1]['degree'] = aligned_list[i]['degree'];
			}
		}
	}

	var c_width = 600; //calendar width
	//iterate through events and add width/left top positions.
	for(var i in aligned_list)
	{
		events[i]['top'] = aligned_list[i]['start']; //top pixel is the start time
		events[i]['left'] = c_width/aligned_list[i]['degree']*(aligned_list[i]['position']-1); //Left most pixel
		events[i]['width'] = c_width/aligned_list[i]['degree']-1;
	}

	return events;
}
