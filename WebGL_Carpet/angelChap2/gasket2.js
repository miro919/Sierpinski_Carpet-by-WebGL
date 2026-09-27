"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(1, -1),
        vec2(  1,  1 ),
        vec2(  -1, 1 )
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4f(uColor, 1.0, 0.0, 0.0, 1.0);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.enableVertexAttribArray(vPosition);

    document.getElementById("subdivisionSlider").onchange = function(event) {
        NumTimesToSubdivide = parseInt(event.target.value);

        points=[];

        divideSquare(vertices[0], vertices[1], vertices[2], vertices[3],
            NumTimesToSubdivide);

        gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        render();
    };

    document.getElementById("colorPicker").onchange = function(event) {
        var hex = event.target.value;

        var r = parseInt(hex.substr(1,2),16)/255;
        var g = parseInt(hex.substr(3,2),16)/255;
        var b = parseInt(hex.substr(5,2),16)/255;

        gl.uniform4f(uColor, r, g, b, 1.0);

        render();
    };

    render();
};

function square( a, b, c, d )
{
    points.push( a, b, c );
    points.push(a,c,d);
}

function divideSquare ( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        square( a, b, c, d );
    }
    else {

        //bisect the sides

        var width = (b[0]- a[0]) /3;
        var height = (d[1]- a[1]) /3;

        --count;

        // three new triangles

        for(var row=0; row<3; row++){
            for (var col=0; col<3; col++) {

                if (row === 1 && col === 1) {
                    continue;
                }
                var x = a[0] + col * width;
                var y = a[1] + row * height;

                var p0 = vec2(x,y);
                var p1 = vec2(x+width, y);
                var p2 = vec2(x+width, y+height);
                var p3 = vec2(x, y+height);

                divideSquare(p0, p1, p2, p3, count);
            }
        }
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
