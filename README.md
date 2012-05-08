##kalender.js

Kalender.js is a basic front-end calendar that deals with overlapping events.

##What?

When displaying events for a day, it might occur that some events might clash. Visualising this might be difficult. Kalendar.js takes times and maps them onto a day to display. An example can be seen in calendar.html.

##Why?

I made this when I applied for an internship. It isn't being used, and it seems like it could be useful, considering that working with overlapping events is not an entirely trivial problem to solve. So I put it online.

##How?

In script.js, replace the json_input with JSON in the format of [{"start":"8:30","end":"9:30"}, etc...}]. Times are currently in the format of <hour>:<minutes>. The format is 24 hours. The calendar currently runs from 9am to 21pm. It can be changed. Just change all instances of start_time and end_time.

##Future plans

Abstract it more so that it can be easily used as jQuery plugin (for example). Put in dates through JSON, and specify the div, and generates the html.
