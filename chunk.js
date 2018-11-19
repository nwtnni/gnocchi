
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
    createBlock(vertices, x, y, z, texture) {
        //  _
        // |_|
        //  *
        this.createWall(vertices, x, z, x + 1, z, y, texture);

        //   _
        // *|_|
        //
        this.createWall(vertices, x, z, x, z + 1, y, texture);

        //  _
        // |_|*
        //
        this.createWall(vertices, x + 1, z, x + 1, z + 1, y, texture);

        //  *
        //  _
        // |_|
        //
        this.createWall(vertices, x, z + 1, x + 1, z + 1, y, texture);

        // Lower face
        this.createFloor(vertices, x, z, x + 1, z + 1, y, texture);

        // Upper face
        this.createFloor(vertices, x, z, x + 1, z + 1, y + 1, texture);
    }

    // Generate the mesh representing the chunk
    chunkMesh() {
        const vertices = [];
        const dx = this.index[0] * this.size;
        const dz = this.index[1] * this.size;
        const sqSize = this.size * this.size;
        for (var i = 0.0; i < this.data.length; i++) {
            if(this.data[i] !== 0) {
                const x = i % this.size;
                const z = Math.floor((i % sqSize) / this.size);
                const y = Math.floor(i / sqSize);
                // TODO: is this flip necessary?
                this.createBlock(vertices, -(x + dx), -y, z + dz, this.data[i]);
            }
        }
        return {
            vertices: vertices,
            indices: Array.from(
                new Array(Math.floor(vertices.length / 5)),
                function (x, i) { return i + 1; }
            )
        };
    }
}
