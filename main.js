const vert = `
    precision highp float;

    attribute vec3 vert_position;
    attribute vec2 vert_texCoord;

    uniform mat4 projection;
    uniform mat4 frame;
    uniform mat4 model;

    varying vec2 geom_texCoord;

    void main() {
        gl_Position = projection * frame * model * vec4(vert_position, 1.0);
       // gl_Position = vec4(vert_position, 1.0);
        geom_texCoord = vert_texCoord;
    }`;

const frag = `
    #extension GL_EXT_draw_buffers : require //needed to enable writing to more than one buffer
    precision highp float;
    varying vec2 geom_texCoord;

    uniform sampler2D texture;

    //** PICKING **//
    //uniform float id; //id for block: index of block in chunk (do we also need to know which chunk the block is in?)
    uniform vec3 id;

    void main() {
        //gl_FragColor = texture2D(texture, geom_texCoord);
        /**
        * Instead of writing to gl_FragColor, we write to elements of gl_FragData.
        * gl_FragData[0]: texture attached to 0th color attachment slot
        * gl_FragData[1]: texture attached to 1st color attachment
        */
        gl_FragData[0] = vec4(id, 0.0); //write ID of primitive to 0th color attachment
        gl_FragData[1] = texture2D(texture, geom_texCoord);  //write primitive color to 1st color attachment 
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

            /********************************************/
            //** FOR PICKING **//
                var fbo = gl.createFrameBuffer();
                
                //create floating point texture to store ids
                var primitiveIndexTexture = createFloatTexture(gl, 512, 512);
                //create render and image buffers 
                var renderBuffer = createDoubleBuffer(gl, 512, 512);
                var imageBuffer = createDoubleBuffer(gl, 512, 512);

            //prepare to read from 0th color attachment (read pixels to get id)
                //  this must be done while FBO still bound and texture still attached
                var SCREEN_CENTER = {
                    x: 0.0,
                    y: 0.0
                };
                var primitiveIndexPixel = new Float32Array(4); 
            /********************************************/
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
            /********************************************/
            /** PICKING: Prepare FBO to write to more than one texture.*/
            //render to texture instead of monitor
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            //attach primitiveIndexTexture as the 0th color attachment of our buffer 
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER, //always gl.FRAMEBUFFER
                    gl.webGlDrawBuffers.COLOR_ATTACHMENT0_WEBGL, //"attachment slot" of FBO ; indicates purpose of texture you're attaching; texture will serve as 0th color
                    gl.TEXTURE_2D, //the kind of texture we're attaching
                    primitiveIndexTexture, //texture we want to attach (must be created beforehand)
                    0); //mipmap level of texture; always 0

            //attach renderBuffer.getWriteBuffer() 1st color attachment slot 
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.webGlDrawBuffers.COLOR_ATTACHMENT1_WEBGL, //texture we're attaching (renderBuffer's write buffer) will be used to draw the actual image
                    gl.TEXTURE_2D,
                    renderBuffer.getWriteBuffer(), //renderBuffer's write buffer 
                    0);

                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_ATTACHMENT,
                    gl.RENDERBUFFER,
                    depthBuffer
                );
                gl.webGlDrawBuffers.drawBuffersWEBGL([
                    gl.webGlDrawBuffers.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
                    gl.webGlDrawBuffers.COLOR_ATTACHMENT1_WEBGL  // gl_FragData[1]
                ]);
            /********************************************/

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
            /********************************************/
                gl.disable(gl.DEPTH_TEST);
                gl.flush(); //PICKING

                gl.readPixels(SCREEN_CENTER.x, SCREEN_CENTER.y, 1, 1, gl.RGBA, gl.FLOAT, primitiveIndexPixel);
                
                //TODO: do something with primitiveIndexPixel!!!!

            //Cleanup: detach textures from FBO
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.webGlDrawBuffers.COLOR_ATTACHMENT0_WEBGL,
                    gl.TEXTURE_2D,
                    null,
                    0);
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.webGlDrawBuffers.COLOR_ATTACHMENT1_WEBGL,
                    gl.TEXTURE_2D,
                    null,
                    0);
                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_ATTACHMENT,
                    gl.RENDERBUFFER,
                    null
                );
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                renderBuffer.swap();




//TODO: not really sure what their code is doing here? drawing from buffers -> screen?
                // Copy pixel from render buffer.
                {
                    drawToBufferAndSwap(gl, fbo, imageBuffer, null, function() {
                        gl.useProgram(textureCopyProgram);
                        if (textureCopyProgram.texture != null) {
                            gl.activeTexture(gl.TEXTURE0);
                            gl.bindTexture(gl.TEXTURE_2D, renderBuffer.getReadBuffer());
                            gl.uniform1i(textureCopyProgram.texture, 0);
                        }
                        drawFullScreenQuad(gl, textureCopyProgram);
                        gl.flush();
                    });
                }
                drawToBufferAndSwap(gl, fbo, imageBuffer, null, function() {
                    gl.useProgram(srgbProgram);
                    if (srgbProgram.texture != null) {
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, imageBuffer.getReadBuffer());
                        gl.uniform1i(srgbProgram.texture, 0);
                    }
                    drawFullScreenQuad(gl, srgbProgram);
                    gl.useProgram(null);
                    gl.flush();
                });

                // Copy pixel from image buffer to screen.
                {
                    gl.useProgram(textureCopyProgram);
                    if (textureCopyProgram.texture != null) {
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, imageBuffer.getReadBuffer());
                        gl.uniform1i(textureCopyProgram.texture, 0);
                    }
                    drawFullScreenQuad(gl, textureCopyProgram);
                }
            /********************************************/
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
