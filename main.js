const vert = `
    precision highp float;

    attribute vec3 vert_position;
    attribute vec2 vert_texCoord;
    attribute vec3 vert_normal;

    uniform mat4 projection;
    uniform mat4 frame;
    uniform mat4 model;
    varying vec3 normal;

    varying vec2 geom_texCoord;
    varying float fog;

    float getFog() {
        float density = 0.002;
        float z = length(vec3(frame * model * vec4(vert_position, 1.0)));
        return clamp(pow(100.0, - density * z * z), 0.0, 1.0);
    }

    void main() {
        //inverse transpose of world matrix for transforming normals
        normal = vert_normal;

        gl_Position = projection * frame * model * vec4(vert_position, 1.0);
        geom_texCoord = vert_texCoord;
        fog = getFog();
    }`;

const frag = `
    precision highp float;
    varying vec2 geom_texCoord;
    varying float fog;

    varying vec3 normal;

    uniform vec4 background;
    uniform sampler2D texture;
    uniform vec3 revLightDir;

    void main() {
        vec3 shadingNormal = normalize(normal);
        vec3 normRevLightDir = normalize(revLightDir);

        float light = dot(shadingNormal, normRevLightDir);

        gl_FragColor = texture2D(texture, geom_texCoord);
        gl_FragColor = mix(background, gl_FragColor, fog);
        gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
        gl_FragColor.rgb *= light;
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
                program.vert_normal = gl.getAttribLocation(program, "vert_normal"); //vertex normals

                // Load uniforms
                program.textureLocation = gl.getUniformLocation(program, "texture");
                program.projectionLocation = gl.getUniformLocation(program, "projection");
                program.frameLocation = gl.getUniformLocation(program, "frame");
                program.modelLocation = gl.getUniformLocation(program, "model");
                program.backgroundLocation = gl.getUniformLocation(program, "background");
                program.revLightDirLocation = gl.getUniformLocation(program, "revLightDir"); //light dir
                // Load textures
                program.wallTexture = createTexture(gl, queue.getResult("wall", false));

                // Player mesh
                const playerMesh = Player.getMesh();
                program.playerMesh = createShape(gl, playerMesh.vertices, playerMesh.indices);

                // Draw a single mesh
                program.draw = function(gl, shape) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
                    gl.enableVertexAttribArray(program.vert_position);
                    gl.vertexAttribPointer(program.vert_position, 3, gl.FLOAT, false, 4 * 8, 0);
                    gl.enableVertexAttribArray(program.vert_texCoord);
                    gl.vertexAttribPointer(program.vert_texCoord, 2, gl.FLOAT, false, 4 * 8, 4 * 3);
                    gl.enableVertexAttribArray(program.vert_normal);
                    gl.vertexAttribPointer(program.vert_normal, 3, gl.FLOAT, false, 4 * 8, 4 * 5);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
                    gl.drawElements(gl.TRIANGLES, shape.size, gl.UNSIGNED_SHORT, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
                };
            },

            // During update loop
            function(gl, program) {

                while (CHUNKS_NEW.length > 0) {
                    const chunk = CHUNKS_NEW.shift();
                    const mesh = CHUNKS[chunk].chunkMesh();
                    CHUNKS_OLD.push(chunk);
                    program.chunk = program.chunk ? program.chunk : {};
                    console.log("Hi");
                    program.chunk[chunk] = createShape(
                        gl,
                        mesh.vertices,
                        mesh.indices
                    );
                }

                while (CHUNKS_OLD.length > CACHED_CHUNKS) {
                    const chunk = CHUNKS_OLD.shift();
                    delete CHUNKS[chunk];
                    delete program.chunk[chunk];
                }

                // Sky color
                gl.clearColor(0.1, 0.5, 0.8, 1.0);
                gl.uniform4f(program.backgroundLocation, 0.1, 0.5, 0.8, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Update entity position and heading
                // maze.translate();
                // maze.rotate();
                // maze.translateGuardians();

                // Update projection, model, and frame matrices
                gl.uniformMatrix4fv(program.modelLocation, false, mat4.create());
                gl.uniformMatrix4fv(program.projectionLocation, false, getProjMatrix());
                gl.uniformMatrix4fv(program.frameLocation, false, getFrameMatrix());
                gl.uniform3fv(program.revLightDirLocation, [0.5, 0.7, 1]); //set lightDir


                // Draw walls
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, program.wallTexture);
                gl.uniform1i(program.textureLocation, 0);

                // Draw received chunks
                if (program.chunk) {
                    Object.values(program.chunk).forEach(
                        mesh => program.draw(gl, mesh)
                    );
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
        src: "textures.png"
    }
]);
