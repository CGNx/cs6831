//Point class for easier manipulation of points
/**
 * Checker represents a playing piece on 
 * the checkerboard.  Checkers may be red or black.
 * A checker may also be a king (usually represented in the physical
 * game by a stack of two checkers, but here represented simply by
 * a boolean property, isKing). 
 */
 
var Circle = function(x, y, r, c) {
    ////////////////////////////////////////////////
    // Representation
    //
	this.x = x;			
	this.y = y;
	this.r = r;
	this.c = c;

	////////////////////////////////////////////////
	// Public methods
	//

	this.toString = function(){	
		return "center: (" + x + ", " + y + "), radius: " + r;
	}
}