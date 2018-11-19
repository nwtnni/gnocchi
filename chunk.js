
class Chunk {
    constructor(n, data) {
        // Chunk dimension (n x n x n blocks)
        this.n = n;

        // Chunk layout
        this.data = data;
    }

    // Create a single vertex and push it onto [vertices] and [indices] lists
    createVertex(vertices, indices, vertex, u, v) {
        indices.push(Math.floor(parseFloat(vertices.length / 5)));

        for (var i = 0; i < vertex.length; i++) {
            vertices.push(vertex[i]);
        }
        
        vertices.push(u);
        vertices.push(v);
    }

    // Create a single square from four corners [bl], [br], [tl], and [tr]
    createSquare(vertices, indices, bl, br, tl, tr) {

        // 3 ---- 2
        //   |x/|
        // 1 |/_|
        this.createVertex(vertices, indices, bl, 0.0, 0.0);
        this.createVertex(vertices, indices, tr, 1.0, 1.0);
        this.createVertex(vertices, indices, tl, 0.0, 1.0);

        //   ---- 3
        //   | /|
        // 1 |/x| 2
        this.createVertex(vertices, indices, bl, 0.0, 0.0);
        this.createVertex(vertices, indices, br, 1.0, 0.0);
        this.createVertex(vertices, indices, tr, 1.0, 1.0);
    }

    // Create a vertical wall from bottom two points [x1, y1] and [x2, y2]
    createWall(vertices, indices, x1, y1, x2, y2, z) {
        const bl = [x1, z, -y1];
        const br = [x2, z, -y2];
        const tl = [x1, z+1, -y1];
        const tr = [x2, z+1, -y2];
        
        this.createSquare(vertices, indices, bl, br, tl, tr);
    }

    // Create a horizontal tile from two corners [x1, y1] and [x2, y2]
    createFloor(vertices, indices, x1, y1, x2, y2, z) {
        
        const bl = [x1, z, -y1];
        const br = [x2, z, -y1];
        const tl = [x1, z, -y2];
        const tr = [x2, z, -y2];
        this.createSquare(vertices, indices, bl, br, tl, tr);
    }

    createBlock(vertices, indices, x, y, z) { // add z        
        this.createWall(vertices, indices, x, y, x + 1, y, z);
        this.createWall(vertices, indices, x, y, x, y + 1, z);
        this.createWall(vertices, indices, x + 1, y, x + 1, y + 1, z);
        this.createWall(vertices, indices, x, y + 1, x + 1, y + 1, z);
        this.createFloor(vertices, indices, x, y, x+1, y+1, z);
        this.createFloor(vertices, indices, x, y, x+1, y+1, z+1);
    }
    // Generate the mesh representing the chunk
    chunkMesh() {
        const vertices = [];
        const indices = [];
        var n = this.n;

        for (var i = 0.0; i < data.length; i++) {
            if(data[i] === 1) {
                var z = Math.floor(parseFloat(i / n));
                var y = Math.floor(parseFloat(i / (Math.pow(n, 2))));
                var x = i - n * z - Math.pow(n, 2) * y;
                
                
                this.createBlock(vertices, indices, x, y, z);
            }
        }
        return {
            vertices: vertices,
            indices: indices
        };
    }

}
