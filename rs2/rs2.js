// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.
$(function() {

	//Global variables
  var ip_address;
  $.get('http://jsonip.com', function (res) {
                        ip_address = res.ip;
                    });
  var NUMBER_OF_CURSORS = 2;
  var NUMBER_BLOCKS_PER_CURSOR = 3; //4  
  var NUMBER_OF_AMPLITUDE_REPEATS = 1; //3
  var NUMBER_OF_TRIALS = 3 * NUMBER_OF_AMPLITUDE_REPEATS; //9
  var NUMBER_OF_TRIAL_SETS = 27; //27
  var NUMBER_OF_BLOCKS = NUMBER_OF_CURSORS * NUMBER_BLOCKS_PER_CURSOR; //8 
  var NUMBER_OF_PRACTICE_TRIALS = 6; //6

	var canvas = document.getElementById('bubble-canvas');      
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle="gray";
  ctx.lineWidth = 2;

  var canvasCursor = document.getElementById('cursor-canvas');      
  var ctxCursor = canvasCursor.getContext('2d');
  ctxCursor.fillStyle="black";
  ctxCursor.strokeStyle="black";

  var canvasClosest = document.getElementById('bubble-closest-canvas');
  var ctxClosest = canvasClosest.getContext('2d');
  ctxClosest.fillStyle = "red";
  ctxClosest.strokeStyle = "lightGray";

  var writingHand = '';

  var blockCount = 1;
  var trialSetCount = 1;
  var trialCount = 1;

  var block_trials = [];
  var block_index = 0;

  var a,w,ewr, d;

  var start;
  var start_time;
  var goal;
  var cursorCircle;
  var circles = [];
  var bubbleCursor = Math.random() < .5 ? true: false;
  var practiceCount = 1;

  //Tracking log data
  var logs = [];

  //clears entire canvas
  function clearCanvas(context) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasCursor.width, canvasCursor.height);
    context.restore();
  }

  //Toggles which cursor is being used
  function toggleCursor() {
    bubbleCursor = bubbleCursor ? false : true;
  }

  //Finds the position of the mouse relative to the canvas.
  //Input: canvas and a mousemove event location on page.
  function getParentPos(canvas, x, y) {
    var rect = canvas.getBoundingClientRect();
    return {x: x - rect.left - 5, y: y - rect.top - 5}; //subtract 5 for border
  }

  //Calculates the distance between two circles.
  //If the circles overlap, returns -1.
  //Input: two circles
  function distanceBetweenCircles(c1, c2) {
    var dx = c2.x - c1.x;
    var dy = c2.y - c1.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist >= c1.r + c2.r) {
      return dist
    }
    return -1;
  }

  //Returns true if circle c does not intersect any circle in global array circle
  //Returns false otherwise.
  //Input: a circle object and a dist circle must be from goal.
  function conflicts (c,dist) {
    if (distanceBetweenCircles(c,goal) < dist) {
      return true;
    }
    else {
      for (var i = 0; i < circles.length; i++) {
        if (distanceBetweenCircles(c,circles[i]) < 0) {
          return true;
        }
      }
    }

    return false;
  }

  //Given a canvas, returns a random location on the canvas that does not touch the edges
  function randLocOnCanvas(canvas, w) {
    return (canvas.width - w) * Math.random() + w/2;
  }

  //Given the location and a context, draws a circle at the location with radius r and color c.
  //Adds the circle to the stack of drawn circles
  function drawCircle(context,c) {
    context.fillStyle = c.c;
    context.beginPath();
    context.arc(c.x,c.y,c.r,0,Math.PI*2,true);
    context.closePath();
    context.fill();     
    context.stroke();
  }

  //Checks if point x,y is within boundary of canvas
  function onCanvas(canvas, x, y, w) {
    return (x > 3*w) && (x < canvas.width - 3*w) && (y > 3*w) && (y < canvas.height - 3*w);

  }

  //Creates the starting circle and adds it to the array of circles
  function drawStart(ctx, w) {
    start = goal;
    start.c = bubbleCursor ? 'white' : 'red';
    start.r = w/2;
    drawCircle(ctx, start);
    circles.push(start);
  }

  //For the very first time...
  //Creates the starting circle and adds it to the array of circles
  function drawFirstStart(canvas, ctx, w) {
    var start_color = bubbleCursor ? 'white' : 'red';
    start = new Circle(randLocOnCanvas(canvas, w),randLocOnCanvas(canvas, w), w/2, start_color);
    drawCircle(ctx, start);
    circles.push(start); 
  }

  //Draws the goal distance a away from start
  function drawGoal(canvas, ctx, a, w) {   
    var x;
    var y;
    do {
      var angle = Math.random()*Math.PI*2; //generates random angle
      x = Math.cos(angle) * a;
      y = Math.sin(angle) * a;
    } while(!onCanvas(canvas,start.x + x,start.y + y,w));
    goal = new Circle(start.x + x,start.y + y, w/2, 'green');
    drawCircle(ctx, goal);
    circles.push(goal);
  }

  //A testing function that helps me debug.
  var loopTimeout = function(i, max, step, interval, func) {
    if (i >= max) {
        return;
    }
    func(i);
    i = i + step;
    setTimeout(function() {
        loopTimeout(i, max, step, interval, func);
    }, interval);
  }

  //Draws the four circles around the goal.
  function drawFour(canvas, ctx, ewr, w) {
    var ew = ewr * w;
    var slope = (goal.y - start.y) / (goal.x - start.x);
    var slopes = [slope, -1/slope];
    
    //Draw a straight line to prove accuracy of these four circles.
    //ctx.beginPath();
    //ctx.moveTo(start.x,start.y);
    //ctx.lineTo(goal.x,goal.y);
    //ctx.stroke();

    //loopTimeout(.01,2, .01, 2000, function(lol) {
    for (var i = 0; i < slopes.length; i++) {
      var x = Math.cos(Math.atan(slopes[i])) * ew;
      var y = Math.sin(Math.atan(slopes[i])) * ew;

      var c = new Circle(goal.x + x, goal.y + y,w/2, 'white');
      drawCircle(ctx, c);
      circles.push(c);

      var c = new Circle(goal.x - x, goal.y - y,w/2, 'white');
      drawCircle(ctx, c);
      circles.push(c);
    } //});
  }

  //d = density - amount of distracters between start and goal
  //w = width - twice the radias of size of goal and distracters
  //ewr = effective width ration
  function drawDistracters(canvas, ctx, d, w, ewr) {
  
  	numDistracters = Math.floor(d / w * 8 * canvas.width - w/2);
    var count = 0;
  	while (count < numDistracters) {
  	  x = randLocOnCanvas(canvas, w);
  	  y = randLocOnCanvas(canvas, w);
  	  c = new Circle(x,y,w/2, 'white');
  	
  	  if (conflicts(c,ewr*w*1.1)) {}
  	  else {
        drawCircle(ctx,c);
        circles.push(c);
        count++;   		
  	  }
  	}
  }

  //Returns the distance between (x1,y1) and (x2,y2)
  function dist(x1,y1,x2,y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx*dx + dy*dy);
  }

  //RETURNS true if x,y is within goal boundary.
  function mouseOnGoal(x,y) {
    return dist(goal.x,goal.y,x,y) < goal.r;
  }

  //Changes color of circles as regular mouse moves over them.
  //View method only
  function handleRegularMouseMovement(x,y) {
    for (var i = 0; i < circles.length; i++) {
      var c = circles[i]
      if (dist(c.x,c.y,x,y) < c.r) {
        if (c.c == 'white') {
          c.c = 'red';
          drawCircle(ctx, c);
        }
        if (c.c == 'green') {
          c.c = 'red';
          drawCircle(ctx, c);
        }
      } else {
          if (c.c == 'red') {
            c.c = (c.x == goal.x) ? 'green': 'white';
            drawCircle(ctx, c);
          }
      }
    }
  }

  //Finds the closet and second closest circle in circles to point (x,y)
  function closestCircles(x,y) {
    var firstMin = 10000;
    var secondMin = 10000;
    var c;
    for (var i = 0; i < circles.length; i++) {
      var d = dist(circles[i].x,circles[i].y,x,y);
      if (d < firstMin) {
        secondMin = firstMin;
        firstMin = d;
        c = circles[i];
      } else if (d < secondMin) {
        secondMin = d;
      }
    }
    return {'closestCircle':c, 'closest':firstMin,'secondClosest':secondMin};
  }

  //draws the dynamic gray bubble and handles
  //changing color of closest pieces.
  function handleBubbleCursorMovement(x,y) {

    clearCanvas(ctxCursor);

    //Draw dynamically changing bubble around cursor
    var dist = closestCircles(x,y);
    var radius = Math.min(dist.closest + w, dist.secondClosest - w/2);
    var c = new Circle(x,y,radius, 'black');
    drawCircle(ctxCursor, c);    
    cursorCircle = dist.closestCircle;

    //Draw bubble around closest circle
    var closest = new Circle(cursorCircle.x,
                             cursorCircle.y,
                             cursorCircle.r + w/8,                             
                             'black');    
    drawCircle(ctxCursor, closest);

    //Draw red on the closest circle
    clearCanvas(ctxClosest);
    drawCircle(ctxClosest, new Circle(cursorCircle.x,
                                      cursorCircle.y,
                                      cursorCircle.r,
                                      'red'));
  }

  //Handler for mouse movement on the canvas
  function handleMouseMove(e) {
    var pos = getParentPos(canvas, e.clientX, e.clientY);
    var x = pos.x;
    var y = pos.y;
    if (bubbleCursor){
      handleBubbleCursorMovement(x,y);
    } else {
      handleRegularMouseMovement(x,y);
    }

  }

  function handleClick(e) {
    if (bubbleCursor) {
      if (distanceBetweenCircles(cursorCircle, goal) == -1) {
        clearCanvas(ctx);
        nextTrial();
      }
    } else { //using regular cusor      
      var pos = getParentPos(canvasCursor, e.clientX, e.clientY);
      if (dist(pos.x, pos.y, goal.x, goal.y) <= goal.r) {  
        clearCanvas(ctx);    
        nextTrial();
      }
    }
  }

  //Fisher-Yates shuffle algorithm.
  Array.prototype.randomize = function()
  {
    var i = this.length, j, temp;
    while ( --i )
    {
      j = Math.floor( Math.random() * (i - 1) );
      temp = this[i];
      this[i] = this[j];
      this[j] = temp;
    }
  }

  //Returns an array of 243 trails, correctly permuted.
  function generateBlock() {
    //Build an array of all 27 combinatiosn of w, ewr, d in random order.
    var trialSet = [];
    var w_values = [8, 16, 32];
    var ewr_values = [1.33, 2, 3];
    var d_values = [0, .5, 1];
    var a_values = [120, 240, 360];

    for (var ww = 0; ww < w_values.length; ww++) {
      for (var ewrr = 0; ewrr < ewr_values.length; ewrr++) {
        for (var dd = 0; dd < d_values.length; dd++) {
          trialSet.push({'w': w_values[ww], 'ewr': ewr_values[ewrr], 'd': d_values[dd]});
        }
      }
    }

    trialSet.randomize();

    //Build a block by adding 9 randomized
    //trials of amplitudes to each combination
    var block = [];
    for (var i = 0; i < trialSet.length; i++) {

      //Permute amplitudes among the 9 trials.
      var amplitudes = [];
      for (var k = 0; k < NUMBER_OF_AMPLITUDE_REPEATS; k++) {
        for (var aa = 0; aa < a_values.length; aa++) {      
          amplitudes.push(a_values[aa]);
        }
      }

      //Randomize the amplitudes
      var randomizedAmplitudes = [];
      var len = amplitudes.length;
      for (var ra = 0; ra < len; ra++) {
        var randIndex = Math.floor(Math.random()*amplitudes.length);
        randomizedAmplitudes.push(amplitudes[randIndex]);
        amplitudes.splice(randIndex, 1);
      }

      //Add a trial for each amplitude
      for (var j = 0; j < randomizedAmplitudes.length; j++) {
        var a = randomizedAmplitudes[j];
        block.push({'a':a, 'w': trialSet[i].w, 'ewr':trialSet[i].ewr, 'd':trialSet[i].d});
      }    
    }
    return block;
  }

  function startBlocks() {
    circles = [];
    clearCanvas(ctx);
    block_index = 0;
    block_trials = [];
    for (var i = 0; i < NUMBER_BLOCKS_PER_CURSOR; i++) {
      block_trials.push.apply(block_trials, generateBlock());
    }
    a = block_trials[block_index].a;
    w = block_trials[block_index].w;
    ewr = block_trials[block_index].ewr;
    d = block_trials[block_index].d;
      
    drawFirstStart(canvas, ctx, w);
    drawGoal(canvas, ctx, a, w);
    drawFour(canvas, ctx, ewr, w);
    drawDistracters(canvas, ctx, d, w, ewr);

    start_time = Date.now();
  }

  function startPractice () {
    //Reset variables
    circles = [];
    clearCanvas(ctx);
    clearCanvas(ctxCursor);
    clearCanvas(ctxClosest);
    block_index = 0;
    practiceCount = 1;
    block_trials = generateBlock();
    practice_trials = [];
    for (var i = 0; i < 6; i++) {
      practice_trials.push(block_trials[Math.floor( Math.random() * block_trials.length )]);
    }
    block_trials = practice_trials;

    a = block_trials[block_index].a;
    w = block_trials[block_index].w;
    ewr = block_trials[block_index].ewr;
    d = block_trials[block_index].d;
      
    drawFirstStart(canvas, ctx, w);
    drawGoal(canvas, ctx, a, w);
    drawFour(canvas, ctx, ewr, w);
    drawDistracters(canvas, ctx, d, w, ewr);

    start_time = Date.now();
  }

  //Updates all of the global variable trials, sets, and blocks counts
  //If new block, switch cursor.
  //If complete, return true;
  function updateExperiment() {
    if (++trialCount%NUMBER_OF_TRIALS == 1) {
      trialCount = 1;
      if (++trialSetCount%NUMBER_OF_TRIAL_SETS == 1) {
        trialSetCount = 1;
        if (++blockCount == (NUMBER_OF_BLOCKS/2 + 1)) {
          $('#halfway-completed').foundation('reveal', 'open');
        } else if (blockCount == (NUMBER_OF_BLOCKS + 1)) {
          return true;
        } else {          
          $('#block-completed').foundation('reveal', 'open');
        }
      } else if (NUMBER_OF_TRIALS >= 9){        
        $('#set-completed').foundation('reveal', 'open');
      }
    }
    return false;
  }

  //Prepares the screen for the next trial
  function nextTrial() {
    //Reset variables
    circles = [];

    if (practiceCount == NUMBER_OF_PRACTICE_TRIALS) {
      $('#practice-completed').foundation('reveal', 'open');
      practiceCount++;
      startBlocks();
      return;
    }
      
    if (practiceCount < NUMBER_OF_PRACTICE_TRIALS) {
      practiceCount++;
    } else {
      $( "#progressbar" ).progressbar({
        value: (blockCount - 1)*NUMBER_OF_TRIAL_SETS*NUMBER_OF_TRIALS + (trialSetCount - 1) * NUMBER_OF_TRIALS + trialCount
      });
      var trial_time = Date.now() - start_time;

      //Export tracking data
      var trial_data =  [ip_address,
                         inputDevice,
                         writingHand,
                         bubbleCursor ? 'bubble' : 'regular',
                         a, w, ewr, d,
                         blockCount,
                         trialSetCount,
                         trialCount,
                         trial_time/1000];
      logs.push(trial_data);

      //Updates progression of experiment.
      //function will return true when the experiment is completed.
      if(updateExperiment()) {
        $('#experiment-completed').foundation('reveal', 'open');
        return;
      }
      $('#progress').html("trial: " + trialCount +
                          ", set: " + trialSetCount +
                          ", block: " + blockCount +
                          ", Last trial's time: "+ trial_time/1000 +
                          ' seconds.');
    }  

    block_index++;
    var trial = block_trials[block_index];
    
    //Set globals
    a = trial.a;
    w = trial.w;
    ewr = trial.ewr;
    d = trial.d;

    drawStart(ctx, w)
    drawGoal(canvas, ctx, a, w);
    drawFour(canvas, ctx, ewr, w);
    drawDistracters(canvas, ctx, d, w, ewr);

    start_time = Date.now();
  }

  /*
  $("#toggleBubbleCursor").click(function(e) {
      if (bubbleCursor) {
        clearCanvas(ctxCursor);
        bubbleCursor = false;
        $("#toggleBubbleCursor").attr("value", "Bubble Cursor Off");
      } else {
        bubbleCursor = true;
        $("#toggleBubbleCursor").attr("value", "Bubble Cursor On");
      }
  });*/

  $("#leftHanded").click(function(e){
    writingHand = "left";
    $('#input-device').foundation('reveal', 'open');
  });

  $("#rightHanded").click(function(e){
    writingHand = "right";
    $('#input-device').foundation('reveal', 'open');

  });

  $("#mouse").click(function(e){
    inputDevice = "mouse";
    $('#instructions').foundation('reveal', 'open');

  });

  $("#trackpad").click(function(e){
    inputDevice = "trackpad";
    $('#instructions').foundation('reveal', 'open');

  });

  $("#start-practice").click(function(e){
    $('#instructions').foundation('reveal', 'close');
    startPractice();
  });

  $("#halfway").click(function(e){
    toggleCursor();
    $('#halfway-completed').foundation('reveal', 'close');
    startPractice();
  });

  $("#block-completed").click(function(e){
    start_time = Date.now();
    $('#block-completed').foundation('reveal', 'close');
  });

  $("#set-completed").click(function(e){
    start_time = Date.now();
    $('#set-completed').foundation('reveal', 'close');
  });

  $("#practice-completed").click(function(e){
    start_time = Date.now();
    $('#practice-completed').foundation('reveal', 'close');
  });

  $(".reveal-modal-bg").click(function(e){
    start_time = Date.now();
  });

  $("#export").click(function(e){
    var data = logs;
    var csvContent = "data:text/csv;charset=utf-8," +
                     "ip_address, pointer_device, dominant_hand, " +
                     "cursor_type, amplitude, width, expected width ratio, " +
                     "density, block, trial_set, trial, time\n"
    data.forEach(function(infoArray, index){
      dataString = infoArray.join(",");
      console.log(dataString);
      csvContent += dataString+ "\n";
    });
    console.log(csvContent);
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  });

   

  //Add event handlers
  $('#bubble-canvas').on('mousemove', handleMouseMove);
  $('#cursor-canvas').on('mousemove', handleMouseMove);
  $('#cursor-canvas').click(handleClick);

  
  $( "#progressbar" ).progressbar({
        value: 1, max: NUMBER_OF_BLOCKS*NUMBER_OF_TRIAL_SETS*NUMBER_OF_TRIALS
      });
  
  $('#writing-hand').foundation('reveal', 'open');


  
  



});