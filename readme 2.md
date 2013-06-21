Housing Application Pre-Questions
=================================

What's this then?
-----------------

A small app designed to guide customers through the initial stages of applying for housing support. 

Each screen presented is determined by the answer given to the previous question.

Each question has multiple answers, some answers link to another question, some link to web pages with additional advice.


Geeky bit
---------

The data model is in the style of a 'choose your own adventure' - get a different question depending on the answer chosen.

Uses [knockout.js](http://www.knockoutjs.com) for quick view-model development.

One small html file to present it. A bit of javascript to make it work. A massive json object to provide the question and answer data. 

