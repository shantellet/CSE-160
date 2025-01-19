// Shantelle Toh
// shtoh@ucsc.edu

// Notes to grader: thanks for grading my work!

var canvas;
var ctx;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    
    // Get the rendering context for 2DCG
    ctx = canvas.getContext('2d');
    
    // Draw a black rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color and make the size 400 x 400


    ////////// Part 2
    // var v1 = new Vector3([2.25, 2.25]); // draw a red vector of this magnitude and direction
    // drawVector(v1, "red");

    // ////////// Part 3
    // let submit1 = document.getElementById("submit1");
    // submit1.addEventListener("click", handleDrawEvent);

    // ////////// Part 5
    // let submit2 = document.getElementById("submit2");
    // submit2.addEventListener("click", handleDrawOperationEvent);
}

function drawVector(v, color) {
    // define center coordinates
    cx = canvas.width / 2;
    cy = canvas.height / 2;

    ctx.strokeStyle = color;

    ctx.beginPath(); // start drawing line
    ctx.moveTo(cx, cy); // start location
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20); // draw line to a certain point
    ctx.stroke();
}

function handleDrawEvent() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

    // Draw a black rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color and make the size 400 x 400

    var x1 = document.getElementById("x1").value;
    var y1 = document.getElementById("y1").value;

    var x2 = document.getElementById("x2").value;
    var y2 = document.getElementById("y2").value;

    var v1 = new Vector3([x1, y1]); // draw a red vector of this magnitude and direction
    drawVector(v1, "red");

    var v2 = new Vector3([x2, y2]); // draw a blue vector of this magnitude and direction
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

    // Draw a black rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color and make the size 400 x 400

    var x1 = document.getElementById("x1").value;
    var y1 = document.getElementById("y1").value;

    var x2 = document.getElementById("x2").value;
    var y2 = document.getElementById("y2").value;

    var v1 = new Vector3([x1, y1, 0.0]); // draw a red vector of this magnitude and direction
    drawVector(v1, "red");

    var v2 = new Vector3([x2, y2, 0.0]); // draw a blue vector of this magnitude and direction
    drawVector(v2, "blue");


    var operation = document.getElementById("operation").value;
    if (operation == "Add") {
        v1.add(v2);
        drawVector(v1, "green");
    }
    else if (operation == "Subtract") {
        v1.sub(v2);
        drawVector(v1, "green");
    }
    else if (operation == "Multiply") {
        var s = document.getElementById("scalar").value;
        v1.mul(s);
        v2.mul(s);
        drawVector(v1, "green");
        drawVector(v2, "green");
    }
    else if (operation == "Divide") {
        var s = document.getElementById("scalar").value;
        v1.div(s);
        v2.div(s);
        drawVector(v1, "green");
        drawVector(v2, "green");
    }
    else if (operation == "Magnitude") {
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
    }
    else if (operation == "Normalize") {
        var v1n = v1.normalize();
        var v2n = v2.normalize();
        drawVector(v1n, "green");
        drawVector(v2n, "green");
    }
    else if (operation == "Angle") {
        var alpha = angleBetween(v1, v2);
        console.log("Angle Between: " + alpha);
    }
    else if (operation == "Area") {
        var area = areaTriangle(v1, v2);
        console.log(areaTriangle(v1, v2));
        console.log("Area of the triangle: " + area);
    }
}

function angleBetween(v1, v2) {
    var d = Vector3.dot(v1, v2);
    var m1 = v1.magnitude();
    var m2 = v2.magnitude();
    var alpha = Math.acos(d / (m1 * m2));
    alpha *= 180 / Math.PI; // convert from radians to degrees
    return alpha;
}

function areaTriangle(v1, v2) {
    var c = Vector3.cross(v1, v2);
    // console.log("c: ", c);
    var area = c.magnitude() / 2;
    return area;
}