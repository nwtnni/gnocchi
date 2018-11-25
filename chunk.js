
class Chunk {
    constructor(size, index, data) {
        // Chunk dimension (size x size x size blocks)
        this.size = size;

        // Chunk position
        this.index = index;

        // Chunk layout
        this.data = data;
    }

    // Create a single vertex and push it onto [vertices] and [indices] lists
    createVertex(vertices, vertex, u, v) {
        for (var i = 0; i < vertex.length; i++) {
            vertices.push(vertex[i]);
        }
        vertices.push(u);
        vertices.push(v);
    }

    // Create a single square from four corners [bl], [br], [tl], and [tr]
    createSquare(vertices, bl, br, tl, tr, texture) {
        var xTex = 0;
        var yTex = 0;
        switch (texture) {
            case 0:
                break;
            case 1:
                xTex = 0.5;
                break;
            case 2:
                yTex = 0.5;
                break;
            case 3:
                xTex = 0.5;
                yTex = 0.5;
                break;
        }

        // 3 ---- 2
        //   |x/|
        // 1 |/_|
        this.createVertex(vertices, bl, 0.0 + xTex, 0.0 + yTex);
        this.createVertex(vertices, tr, 0.5 + xTex, 0.5 + yTex);
        this.createVertex(vertices, tl, 0.0 + xTex, 0.5 + yTex);

        //   ---- 3
        //   | /|
        // 1 |/x| 2
        this.createVertex(vertices, bl, 0.0 + xTex, 0.0 + yTex);
        this.createVertex(vertices, br, 0.5 + xTex, 0.0 + yTex);
        this.createVertex(vertices, tr, 0.5 + xTex, 0.5 + yTex);
    }

    // Create a vertical wall from bottom two points [x1, z1] and [x2, z2] at height [y]
    createWall(vertices, x1, z1, x2, z2, y, texture) {
        const bl = [x1, y, z1];
        const br = [x2, y, z2];
        const tl = [x1, y + 1, z1];
        const tr = [x2, y + 1, z2];
        this.createSquare(vertices, bl, br, tl, tr, texture);
    }

    // Create a horizontal tile from two corners [x1, z1] and [x2, z2] at height [y]
    createFloor(vertices, x1, z1, x2, z2, y, texture) {
        const bl = [x1, y, z1];
        const br = [x2, y, z1];
        const tl = [x1, y, z2];
        const tr = [x2, y, z2];
        this.createSquare(vertices, bl, br, tl, tr, texture);
    }

    // Create a cube with min-x, min-y, min-z coordinate at [x, y, z]
    createBlock(vertices, x, y, z, texture, faces) {

        for (var i = 0; i < faces.length; i++) {
            switch (faces[i]) {

            // TODO ...and X, -X? what's happening
            case 2:
                //   _
                // *|_|
                //
                this.createWall(vertices, x, z, x, z + 1, y, texture);
                break;

            // TODO: +z and -z directions also flipped???
            case 3: 
                //  _
                // |_|
                //  *
                this.createWall(vertices, x, z, x + 1, z, y, texture);
                break;
            case 0:
                //  _
                // |_|*
                //
                this.createWall(vertices, x + 1, z, x + 1, z + 1, y, texture);
                break;
            case 1:
                //  *
                //  _
                // |_|
                //
                this.createWall(vertices, x, z + 1, x + 1, z + 1, y, texture);
                break;

            // TODO: lower face and upper face flipped
            case 5:
                // Lower face
                this.createFloor(vertices, x, z, x + 1, z + 1, y, texture);
                break;
            case 4:
                // Upper face
                this.createFloor(vertices, x, z, x + 1, z + 1, y + 1, texture);
                break;
            }
        }
    }

    // Generate the mesh representing the chunk
    chunkMesh() {
        const vertices = [];
        const dx = Math.floor(this.index[0] * this.size / 3);
        const dz = Math.floor(this.index[1] * this.size / 3);
        for (var i = 0; i < this.data.length; i++) {
            const block = this.data[i];
            const location = block[0];
            const material = block[1];
            const faces = block[2];
            const x = location[0] + dx;
            const y = location[1];
            const z = location[2] + dz;

            // TODO: why is this -y
            this.createBlock(vertices, -x, -y, z, material, faces);
        }
        return {
            vertices: vertices,
            indices: Array.from(
                new Array(Math.floor(vertices.length / 5)),
                function (x, i) { return i; }
            )
        };
    }
}
