# subwayMap
A jquery plugin to render data as a subway map visualization

![image](https://user-images.githubusercontent.com/1822081/50102208-c1804d00-0224-11e9-8a8c-c5f5a83939cc.png)


# Step-by-Step Guide

Here is a guide to using the Subway Map Visualization jQuery Plugin. 
Before you get started, there’s one thing you’ll want to keep in mind — beautiful subway maps are never automatic; they are almost always the result of care in design and placement to ensure that the resulting map is functional, legible and beautiful. 
This plugin is just a tool … you will still need to plan and design your map in order to produce a good result.

## Referencing the Plugin

The subwayMap plugin is referenced similar to other jQuery plugins by adding a script element to the HTML markup.

```
<script src="http://code.jquery.com/jquery-1.4.2.min.js" type="text/javascript"></script>
<script src="jquery.subwayMap-0.5.2.js" type="text/javascript">
```

## Using the Plugin

The subwayMap plugin is called using a jQuery selector as follows:

`$("#sampleselector").subwayMap({ debug: true });`

The only supported option (at present) is “debug” which has a default value of “false”. Setting it to true will display some debug statements in the JS console.

## HTML Markup for Plugin

Like most navigation plugins, subwayMap uses an unordered list. The basic markup consists of the following:

* An outer DIV element to control general placement, background etc.
* One UL element for each “line” desired in the map.
* For each UL element, one or more LI elements with either plain text or an A element with plain text. An LI element provides coordinates for drawing lines and/or markers on the map.

Each of the DIV, UL and LI elements make use of custom attributes to convey how the map should be rendered. These are explained in the Step-by-Step section below.

## Map Rendering

The subwayMap plugin renders the map on a grid with the origin at top left (i.e. X coordinates extend from left to right and Y coordinates extend from top to bottom). The size of this grid depends on a value you define called “cellSize.” For example, if you define a cellSize of 50 and specify a grid of 20 columns by 10 rows, then you will have a map that is 1000 pixels wide and 500 pixels high. For each UL element, a <canvas> element that is the size of the grid is created and positioned at (0,0). Subsequent <canvas> elements are stacked on top of the prior <canvas> elements. Station and interchange markers for each line are also created in separate, stacked <canvas> elements, however their z-Index is always higher than that of the <canvas> elements containing the lines. Finally, all labels are added as elements with the highest z-Index of all the elements in the map.

## Creating a SubwayMap Step-by-Step

Now that the basics are out of the way, let’s step through the process of creating a subway map from scratch. I am using jQuery UI as my mapping subject, creating a line for Widgets, Interactions and Effects. Here’s a map and the markup used to create it:

