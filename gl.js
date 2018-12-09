function initializeCanvas(canvasName) {
    const canvas = document.getElementById(canvasName);
    var gl = canvas.getContext("experimental-webgl");

    if (!gl) { gl = canvas.getContext("webgl"); }
    if (!gl) { throw new Error("Cannot get WebGL context"); }
    return gl;
}

function createShader(gl, source, type) {
    const shader = gl.createShader(type);
    if (!shader) { throw new Error("Unable to create GL shader"); }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const infoLog = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shader: " + infoLog);
    } else {
        return shader;
    }
}

function createProgram(gl, vertex, fragment) {
    const program = gl.createProgram();

    if (!program) throw new Error("Failed to create GLSL program");

    gl.attachShader(program, createShader(gl, vertex, gl.VERTEX_SHADER));
    gl.attachShader(program, createShader(gl, fragment, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.validateProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error("An error occurred linking the program: " + info);
    }

    return program;
}

function createShape(gl, vertexData, indexData) {
    var shape = {};

    var vertexArray = new Float32Array(vertexData);
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexArray = new Uint16Array(indexData);
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    shape.vertexBuffer = vertexBuffer;
    shape.indexBuffer = indexBuffer;
    shape.size = indexData.length;

    return shape;
}

function drawShape(gl, program, shape) {
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
    var positionLocation = gl.getAttribLocation(program, "vert_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4*5, 0);

    var texCoordLocation = gl.getAttribLocation(program, "vert_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 4*5, 4*3);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
    gl.drawElements(gl.TRIANGLES, shape.size, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function createTexture(gl, image) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function startWebGL(canvasName, vertexShader, fragmentShader, setup, during) {
    var gl = initializeCanvas(canvasName);
    var program = createProgram(gl, vertexShader, fragmentShader);

    // program.chevron_angles = gl.getUniformLocation(program, "chevron_angles[0]");
    // program.num_chevrons = gl.getUniformLocation(program, "num_chevrons");

    setup(gl, program);

    // var vertexData = [
    //     -1.0, -1.0, 0.0,
    //     -1.0, -1.0,
    //     1.0, -1.0, 0.0,
    //     1.0, -1.0,
    //     1.0, 1.0, 0.0,
    //     1.0, 1.0,
    //     -1.0, 1.0, 0.0,
    //     -1.0, 1.0,
    // ];

    // var indexData = [
    //     0, 1, 2, 0, 2, 3
    // ];

    // var rectangle = createShape(gl, vertexData, indexData);

    function updateWebGL() {
        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        //drawShape(gl, program, rectangle);

        

        // if (program.chevron_angles != null) {
        //     gl.uniform1f(program.chevron_angles, GRAPH);
        // }
        // if (program.num_chevrons != null) {
        //     gl.uniform1i(program.num_chevrons, GRAPH.getNode().outgoingAngles().length);
        // }
        // console.log( GRAPH);



        during(gl, program);

        gl.useProgram(null);

        window.requestAnimationFrame(updateWebGL);
    }

    window.requestAnimationFrame(updateWebGL);
}
