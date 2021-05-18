function drawSegment(context,x,y,length,width,direction,color){
            
	//direction is either x or y x=horizontal, y=vertical 
	
	if(direction == 'x'){
					
		cd = [			
			{
				x: x-(length/2+width/2),
				y: y
			},
			{
				x: x-(length/2),
				y: y-(width/2)
			},
			{
				x: x+(length/2),
				y: y-(width/2)
			},
			{
				x: x+(length/2)+width/2,
				y: y
			},
			{
				x: x+(length/2),
				y: y+(width/2)
			},
			{
				x: x-(length/2),
				y: y+(width/2)
			}
			/*,
			{
				x: x-(length/2+width/2),
				y: y
			}
			*/
		];
		
	}else{
		cd = [			
				{
					x: x,
					y: y-(length/2)-(width/2)
				},
				{
					x: x+(width/2),
					y: y-(length/2)
				},
				{
					x: x+(width/2),
					y: y+(length/2)
				},
				{
					x: x,
					y: y+(length/2)+(width/2)
				},					
				{
					x: x-(width/2),
					y: y+(length/2)
				},
				{
					x: x-(width/2),
					y: y-(length/2)
				}
				/*,
				{
					x: x-(length/2+width/2),
					y: y
				}
				*/
			];
	}
	
	context.fillStyle   = color;
	context.strokeStyle = color;
	context.lineWidth   = 1;
	
	context.beginPath();
	context.moveTo(cd[0].x,cd[0].y);
	context.lineTo(cd[1].x,cd[1].y);
	context.lineTo(cd[2].x,cd[2].y);
	context.lineTo(cd[3].x,cd[3].y);
	context.lineTo(cd[4].x,cd[4].y);		
	context.lineTo(cd[5].x,cd[5].y);	
	//context.lineTo(cd[6].x,cd[6].y); //This would finish the path back at the starting point. We'll just close it with the built in function.
	context.closePath();
	context.fill();
	context.stroke();
}

function drawDecimalPoint(x,y,color){
	context.fillStyle   = color;
	context.strokeStyle = color;
	context.lineWidth   = 1;
	context.beginPath();
	context.arc(x, y, 8, 0, Math.PI*2, true);
	context.closePath();
	context.fill();
}
	
function draw7segment(x,y){


	// Our 7 segment display, rendered in beautiful html5 canvas
	
	drawSegment(context,x,y-64,50,10,'x',returnColor(0)); //top
	drawSegment(context,x,y,50,10,'x',returnColor(1)); //middle
	drawSegment(context,x,y+64,50,10,'x',returnColor(2)); //bottom
	
	drawSegment(context,x-32,y-32,50,10,'y',returnColor(3)); //upper left
	drawSegment(context,x+32,y-32,50,10,'y',returnColor(4)); //upper right
	drawSegment(context,x-32,y+32,50,10,'y',returnColor(5)); //lower left
	drawSegment(context,x+32,y+32,50,10,'y',returnColor(6)); //lower right
	
	//Handles the Decimal Point
	drawDecimalPoint(x+54,y+64,returnColor(7));
	
}

function returnColor(bit){
	if(mouseOverRegister === bit) {
		return "#FFB6C1";
	}
	return (outputRegister[bit] == 1)? "#f00":"#eee";
}

function drawRegisters(register1,register2,x,y){
	context.fillStyle = "#000";
	context.font = "bold 18px sans-serif";
	
	reg1String = "";
	reg2String = "";
			
	for(i=0; i < register1.length; i++){
		reg1String += register1[i];
	}
	
	for(i=0; i < register2.length; i++){
		reg2String += register2[i];
	}
	
	context.fillText("Output Pin 'Q_' :", x, y-20);
	context.fillText("Storage Register: ", x, y);
	context.fillText("Shift Register: ", x, y+20);

	context.font = "bold 18px monospace";
	context.fillText("ABCDEFGH", x+165, y-20);
	context.fillText(reg2String, x+165, y);
	context.fillText(reg1String, x+165, y+20);
	
	for(i=0; i < register1.length; i++){
		context.fillStyle = '#ff0000';
	
		if(registerCoordsSet == false){    
			pinCoords.push([x+165 + (i*10), y , x+180 + (i*10)  ,y+20]);
		}
	}
	if(registerCoordsSet == false){
		registerCoordsSet = true;
	}
}

function pushBit(){
	internalRegister.unshift(bitValue);
	internalRegister.pop();
	serialOutVal = internalRegister[internalRegister.length-1];
	draw();
}

function shiftOut(){
	if(!outputEnable){
		outputRegister = internalRegister.slice(0); //internalRegister;
	}
}

function toggleBit(){
	bitValue = (bitValue == 0)? 1: 0;
	draw();
	return true;
}

function toggleOE(){
	outputEnable = (outputEnable == 0)? 1: 0;
	draw();
	return true;
}

function doShiftOut(){
	shiftOut();
	draw();
	return true;
}

function doMasterReclear(){
	internalRegister = [0,0,0,0,0,0,0,0];
	draw();
	return true;
}

function setup(){
	canvas = document.getElementById('canvas');
	canvas.onselectstart = function () {return false;}
	context = canvas.getContext('2d');
	
	
	internalRegister = [0,0,0,0,0,0,0,0];
	outputRegister = [0,0,0,0,0,0,0,0];
	
	bitValue = 0;
	serialOutVal = 0;
	serialClockVal = 0;
	latchVal = 0;
	outputEnable = 0;
	masterReclear = 0;
	
	pinCoordsSet = false;
	registerCoordsSet = false;
	
	gndText = ["Ground","Connect to Ground"];
	vccText = ["Input Voltage","Check your datasheet."," The 74HC595 says up to 7 volts."];
	
	outputPinText = ["Output Pins","QA - QH","These pins provide matching" ,"output from the shift register.","Depending on the storage","register value at the time of ","the latch being tripped, it will","set this pin high or low."];
	serialOutText = ["Serial Out","QH'","This pin allows you to send ","the last bit in the storage ","register to another shift ","register. It will receive the ","last bit in the storage","register when the clock is"," advanced. You would connect","this to your serial In on the","next shift register."];
	masterReclearText = ["Master Reclear","The Storage Register clear ","allows you to clear out ","the entire storage register ","without pushing the clock ","through 8 times."];
	rClockText = ["Shift Register Clock","The shift register clock, or","more commonly called the ","\"latch\" pushes the values","in the storage register","out to the shift register."];
	strClockText = ["Storage Register Clock","The Storage Register Clock","advances the bits in the ","storage register. It takes","the value at the serial line","(high or low) and \"pushes\"","the values of the storage","register forward one place.","The last value in","the storage register \"falls off\""," the end (and goes to QH',","the serial out pin)"];
	oeText = ["Output Enable","The Output Enable pin allows","you to control whether or not","the latch (shift register clock)","will push the storage register","values out or not. This pin is","\"active low\", meaning it must","be tied LOW (not HIGH) in order","to function properly."];
	serText = ["Serial Input","Serial Input is the pin where ","you will provide the next value","to go into the register. You","set this pin HIGH or LOW,","and push the Storage Clock high","to slide the value into the","storage register."];
	
	pinNames = [
				["QB",outputPinText,1],
				["QC",outputPinText,2],
				["QD",outputPinText,3],
				["QE",outputPinText,4],
				["QF",outputPinText,5],
				["QG",outputPinText,6],
				["QH",outputPinText,7],
				["GND",gndText],
				["VCC",vccText],
				["QA",outputPinText,0],
				["SER",serText,null,"bitValue"],
				["OE",oeText,null,"outputEnable"],
				["RCLK",rClockText,null,"latchVal"],
				["SRCLK",strClockText,null,"serialClockVal"],
				["SRCLR",masterReclearText,null,"masterReclear"],
				["QH'",serialOutText,null,"serialOutVal"]
				];
	
	//Setup mouse events on the canvas
	canvas.addEventListener("click",clickHandler,false);
	canvas.addEventListener("mousedown",mouseDownHandler,false);
	canvas.addEventListener("mouseup",mouseUpHandler,false);
	canvas.addEventListener("mousemove",mouseOverHandler,false);
	
	buttons = [
			[15,50,150,30,"Serial Input Toggle",null,'toggleBit'],
			[15,85,150,30,"Clock",'pushBit','lightClockPin','dimClockPin'],
			[15,120,150,30,"Latch",'doShiftOut','lightLatchPin','dimLatchPin'],
			[15,155,150,30,"Storage Register Reclear",'doMasterReclear','lightMasterReclear','dimMasterReclear'],		           
			[15,205,150,30,"Output Enable Toggle",null,'toggleOE']
			];
	
	buttonCoords = [];
	pinCoords = [];
	mouseOverRegister = -1;
	
	draw();
}


function drawButtons(){
	for(i = 0; i < buttons.length; i++){
		drawButton(
				buttons[i][0],
				buttons[i][1],
				buttons[i][2],
				buttons[i][3],
				buttons[i][4],
				buttons[i][5]
		);
	}
}

function drawButton(x,y,width,height,buttonName,buttonFunction){
	context.strokeStyle = '#000';
	context.lineWidth   = 2;
	context.strokeRect(x, y, width, height);
	
	context.textBaseline = "middle";
	context.textAlign = "left";
	context.fillStyle = "#000";
	context.font = "bold 12px sans-serif";
	context.fillText(buttonName, x+3,y+height/2);
	
	coordArray = [x,y,x+width,y+height];
	buttonCoords.push(coordArray);
	
}

function getCursorPosition(e) {
	/* returns Cell with .row and .column properties */
	var x;
	var y;
	if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	}
	else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	return [x,y];
}

function checkButton(x,y){
	
	for(i = 0; i < buttonCoords.length; i++){
		if(
			x > buttonCoords[i][0] && 
			x < buttonCoords[i][2] &&
			y > buttonCoords[i][1] &&
			y < buttonCoords[i][3]
		){
			return i;
		}
	}
	return false;
}

function checkObjectLocation(x,y){
	
	for(i = 0; i < pinCoords.length; i++){
		if(
			x > pinCoords[i][0] && 
			x < pinCoords[i][2] &&
			y > pinCoords[i][1] &&
			y < pinCoords[i][3]
		){
			return i;
		}
	}
	return false;
}

function drawSchematic(x,y){

	context.fillStyle = "#000";
	context.font = "bold 12px sans-serif";
	context.fillText("595 Shift Register",x,y-10);
	
	
	context.strokeStyle = '#000';
	context.lineWidth   = 2;
	context.strokeRect(x, y,  100, 200);
	
	
	context.strokeStyle = "#000";
	context.lineWidth   = 2;
	context.beginPath();
	context.arc(x+50, y+4, 8, (Math.PI/180)*215, (Math.PI/180)*-35 , true);
	context.stroke();
	
	
	for(i = 0; i < 16; i++){
		
		lightPin = false;
		
		context.strokeStyle = '#000';
		
		if(pinNames[i][2] != null ){
			if(outputRegister[pinNames[i][2]] == 1 ){
				//context.strokeStyle = '#f00';
				lightPin = true;
			}
		}else{
			if(pinNames[i][3] != undefined){
				lightPin = (window[pinNames[i][3]] == 1)? true:false;
			}
		}
		
		context.lineWidth   = 1;
		context.fillStyle = "#000";
		context.font = "bold 12px sans-serif";
		
		if(i < 8){

			if(lightPin){
				context.fillStyle = "#f00";
				context.fillRect(x-20, y+10+i*24,  20, 12);
			}
			context.strokeRect(x-20, y+10+i*24,  20, 12);
			
			if(!pinCoordsSet){
				pinCoords.push([x-20, y+10+i*24,x,(y+10+i*24)+12]);
			}
			
			
			context.fillText(pinNames[i][0], x+5, y+20+i*24);
		}else{
			
			if(lightPin){
				context.fillStyle = "#f00";
				context.fillRect(x+100, y+10+(i-8)*24,  20, 12);
			}
			
			context.strokeRect(x+100, y+10+(i-8)*24,  20, 12);
			if(!pinCoordsSet){
				pinCoords.push([x+100, y+10+(i-8)*24, x+120, (y+10+(i-8)*24)+12]);
			}
			
			
			context.textAlign = "right";
			context.fillText(pinNames[i][0], x+95, y+20+(i-8)*24);
		}
	}
	pinCoordsSet = true;
}	
	   
function clickHandler(e){
	cset = getCursorPosition(e);
	res = checkButton(cset[0],cset[1]);
	if(res !== false && buttons[res][5] != null){
		//alert(res);
		window[buttons[res][5]]();
	}
}

function mouseDownHandler(e){
	cset = getCursorPosition(e);
	res = checkButton(cset[0],cset[1]);
	if(res !== false && buttons[res][6] != undefined){
		window[buttons[res][6]]();
		draw();
	}
}

function mouseUpHandler(e){
	cset = getCursorPosition(e);
	res = checkButton(cset[0],cset[1]);
	if(res !== false && buttons[res][7] != undefined){
		window[buttons[res][7]]();
		draw();
	}
}

function mouseOverHandler(e){
	cset = getCursorPosition(e);
	res = checkObjectLocation(cset[0],cset[1]);
	console.log(res);
	if(res !== false && res < 9) {
		mouseOverRegister = res;
		draw();
	}else if(res !== false){
		drawPinInfo(res);
	}else{
		mouseOverRegister = -1;
		draw();
	}
}

function drawPinInfo(pin){

	context.strokeStyle = '#000';
	context.lineWidth   = 2;
	context.strokeRect(375, 100, 200, pinNames[pin - 8][1].length*17+10);
	context.fillStyle = "#fff";
	context.fillRect(375, 100, 200, pinNames[pin - 8][1].length*17+10);
	
	for(i = 0; i < pinNames[pin - 8][1].length; i++){
		context.textBaseline = "middle";
		context.textAlign = "left";
		context.fillStyle = "#000";
		context.font = "bold 12px sans-serif";
		context.fillText(pinNames[pin - 8][1][i], 378,115+i*17);			
	}
	
			
}

function lightClockPin(){
	serialClockVal = 1;
}
function dimClockPin(){
	serialClockVal = 0;
}

function lightLatchPin(){
	latchVal = 1;
}
function dimLatchPin(){
	latchVal = 0;		
}

function lightMasterReclear(){
	masterReclear = 1;
}
function dimMasterReclear(){
	masterReclear = 0;		
}	

function draw(){
	
	canvas = document.getElementById('canvas');
	canvas.width = canvas.width;
	draw7segment(500,180); 
	drawRegisters(internalRegister,outputRegister,375,60);

	drawButtons();
	drawSchematic(225,50);
}