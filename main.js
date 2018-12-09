const vert = `
    precision highp float;

    attribute vec3 vert_position;
    attribute vec2 vert_texCoord;

    uniform mat4 projection;
    uniform mat4 frame;
    uniform mat4 model;

    varying vec2 geom_texCoord;
    varying float fog;

    float getFog() {
        float density = 0.001;
        const float LOG2 = 1.442695;
        float z;
        z = length(vec3(model * vec4(vert_position, 1.0)));
        return clamp(exp2(- density * z * z * LOG2), 0.0, 1.0);
    }

    void main() {
        gl_Position = projection * frame * model * vec4(vert_position, 1.0);
       // gl_Position = vec4(vert_position, 1.0);
        geom_texCoord = vert_texCoord;
        fog = getFog();
    }`;

const frag = `
    precision highp float;
    varying vec2 geom_texCoord;
    varying float fog;

    uniform sampler2D texture;

    void main() {
        vec4 fogColor = vec4(0.1, 0.1, 0.1, 1);
        gl_FragColor = texture2D(texture, geom_texCoord);
        gl_FragColor = mix(fogColor, gl_FragColor, fog);
        gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
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
                program.projectionLocation = gl.getUniformLocation(program, "projection");
                program.frameLocation = gl.getUniformLocation(program, "frame");
                program.modelLocation = gl.getUniformLocation(program, "model");

                // Load textures
                program.wallTexture = createTexture(gl, queue.getResult("wall", false));

                // Player mesh
                const playerMesh = Player.getMesh();
                program.playerMesh = createShape(gl, playerMesh.vertices, playerMesh.indices);

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
            },

            // During update loop
            function(gl, program) {

                while (CHUNKS.length > 0) {
                    const chunk = CHUNKS.pop();
                    const mesh = chunk.chunkMesh();
                    program.chunk = program.chunk ? program.chunk : [];
                    program.chunk.push(createShape(
                        gl,
                        mesh.vertices,
                        mesh.indices
                    ));
                }

                // Sky color
                // gl.clearColor(0.3, 0.7, 1.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Update entity position and heading
                // maze.translate();
                // maze.rotate();
                // maze.translateGuardians();

                // Update projection, model, and frame matrices
                gl.uniformMatrix4fv(program.modelLocation, false, mat4.create());
                gl.uniformMatrix4fv(program.projectionLocation, false, getProjMatrix());
                //console.log(getFrameMatrix());
                gl.uniformMatrix4fv(program.frameLocation, false, getFrameMatrix());

                // Draw walls
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, program.wallTexture);
                gl.uniform1i(program.textureLocation, 0);

                // Draw received chunks
                if (program.chunk) {
                    for (var i = 0; i < program.chunk.length; i++) {
                        program.draw(gl, program.chunk[i]);
                    }
                }

                // Draw other players
                for (const k of ENTITIES.keys()) {
                    const model = ENTITIES.get(k).getModelMatrix();
                    gl.uniformMatrix4fv(program.modelLocation, false, model);
                    program.draw(gl, program.playerMesh);
                }
            }
        );
    }, this
);

queue.loadManifest([
    {
        id: "wall",
        src: "texture.png"
    }
]);
