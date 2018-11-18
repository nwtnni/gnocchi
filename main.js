const vert = `
    precision highp float;

    attribute vec3 vert_position;
    attribute vec2 vert_texCoord;

    // uniform mat4 projection;
    // uniform mat4 frame;
    // uniform mat4 model;

    varying vec2 geom_texCoord;

    void main() {
        //gl_Position = projection * frame * model * vec4(vert_position, 1.0);
        gl_Position = vec4(vert_position, 1.0);
        geom_texCoord = vert_texCoord;
    }`;

const frag = `
    precision highp float;
    varying vec2 geom_texCoord;

    uniform sampler2D texture;

    void main() {
        gl_FragColor = texture2D(texture, geom_texCoord);
    }`;

var queue = new createjs.LoadQueue();
queue.on("complete",
    function() {
        startWebGL(
            "webglCanvas",
            vert,
            frag,

            // Before update loop
            function(gl, program) {

                // Load attributes for mesh vertices
                program.vert_position = gl.getAttribLocation(program, "vert_position");
                program.vert_texCoord = gl.getAttribLocation(program, "vert_texCoord");

                // Load uniforms
                program.textureLocation = gl.getUniformLocation(program, "texture");
                // program.projectionLocation = gl.getUniformLocation(program, "projection");
                // program.frameLocation = gl.getUniformLocation(program, "frame");
                // program.modelLocation = gl.getUniformLocation(program, "model");

                // Load textures
                program.blockTexture = createTexture(gl, queue.getResult("block", false));

                // Draw a single mesh
                program.draw = function(gl, shape) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
                    gl.enableVertexAttribArray(program.vert_position);
                    gl.vertexAttribPointer(program.vert_position, 3, gl.FLOAT, false, 4 * 5, 0);
                    gl.enableVertexAttribArray(program.vert_texCoord);
                    gl.vertexAttribPointer(program.vert_texCoord, 2, gl.FLOAT, false, 4 * 5, 4 * 3);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
                    gl.drawElements(gl.TRIANGLES, shape.size, gl.UNSIGNED_SHORT, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
                };

                const chunkMesh = chunk.chunkMesh();
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
                // chunkMesh.vertices = vertexData;
                // chunkMesh.indices = indexData;
                program.chunk = createShape(
                    gl,
                    chunkMesh.vertices,
                    chunkMesh.indices
                );
                console.log(chunkMesh.vertices);
                

            },

            // During update loop
            function(gl, program) {

                // Sky color
                gl.clearColor(0.3, 0.7, 1.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Hot reloading of new mazes
                // if (RELOAD_MAZE) {
                //     const chunkMesh = chunk.chunkMesh();
                //     program.chunk = createShape(
                //         gl,
                //         chunkMesh.vertices,
                //         chunkMesh.indices
                //     );

                //     RELOAD_MAZE = false;
                // }

                // // Disable user input if game over
                // GAME_OVER = maze.gameOver();

                // Update entity position and heading
                // maze.translate();
                // maze.rotate();
                // maze.translateGuardians();

                // Update projection, model, and frame matrices
                // gl.uniformMatrix4fv(program.modelLocation, false, mat4.create());
                // gl.uniformMatrix4fv(program.projectionLocation, false, getProjMatrix());
                // gl.uniformMatrix4fv(program.frameLocation, false, getFrameMatrix());

                // Draw walls
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, program.blockTexture);
                gl.uniform1i(program.textureLocation, 0);
                program.draw(gl, program.chunk);

            }
        );
    }, this
);

queue.loadManifest([
    {
        id: "block",
        src: "wall.jpg"
    }
//     {
//         id: "floor",
//         src: "data/floor.jpg"
//     },
//     {
//         id: "eye",
//         src: "data/eye.jpg"
//     }
]);
