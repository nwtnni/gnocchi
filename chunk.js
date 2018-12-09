
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
    createVertex(vertices, vertex, u, v, normal) {
        for (var i = 0; i < vertex.length; i++) {
            vertices.push(vertex[i]);
        }
        vertices.push(u);
        vertices.push(v);
        for (var i = 0; i < normal.length; i++) {
            vertices.push(normal[i]);
        }
    }

    // Create a single square from four corners [bl], [br], [tl], and [tr]
    createSquare(vertices, bl, br, tl, tr, texture) {
        var xTex = 0;
        var yTex = 0;
        switch (texture) {
            case 5:
                break;
            case 6:
                xTex = 0.25;
                break;
            case 7:
                xTex = 0.5;
                break;
            case 8:
                xTex = 0.75;
                break;
            case 1:
                yTex = 0.5;
                break;
            case 2:
                xTex = 0.25;
                yTex = 0.5;
                break;
            case 3:
                xTex = 0.5;
                yTex = 0.5; 
                break;
            case 4:
                xTex = 0.75;
                yTex = 0.5;
                break;
        }

        // 3 ---- 2
        //   |x/|
        // 1 |/_|
        var normal = vec3.create();
        var vec1 = vec3.fromValues(tr[0] - bl[0], tr[1] - bl[1], tr[2] - bl[2]); //tr - bl
        var vec2 = vec3.fromValues(tl[0] - bl[0], tl[1] - bl[1], tl[2] - bl[2]); //tl - bl
        vec3.cross(normal, vec1, vec2);
        vec3.normalize(normal, normal);
        this.createVertex(vertices, bl, 0.0 + xTex, 0.0 + yTex, normal);
        this.createVertex(vertices, tr, 0.25 + xTex, 0.5 + yTex, normal);
        this.createVertex(vertices, tl, 0.0 + xTex, 0.5 + yTex, normal);

        //   ---- 3
        //   | /|
        // 1 |/x| 2
        var normal2 = vec3.create();
        var veca = vec3.fromValues(br[0] - bl[0], br[1] - bl[1], br[2] - bl[2]); //br - bl
        var vecb = vec3.fromValues(tr[0] - bl[0], tr[1] - bl[1], tr[2] - bl[2]); //tr - bl
        vec3.cross(normal2, veca, vecb);
        vec3.normalize(normal2, normal2);
        this.createVertex(vertices, bl, 0.0 + xTex, 0.0 + yTex, normal2);
        this.createVertex(vertices, br, 0.25 + xTex, 0.0 + yTex, normal2);
        this.createVertex(vertices, tr, 0.25 + xTex, 0.5 + yTex, normal2);
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
        // Western face
        (faces & 1) && this.createWall(vertices, x, z, x, z - 1, y, texture);
        // Southern face
        (faces & 2) && this.createWall(vertices, x, z, x + 1, z, y, texture);
        // Eastern face
        (faces & 4) && this.createWall(vertices, x + 1, z, x + 1, z - 1, y, texture);
        // Northern face
        (faces & 8) && this.createWall(vertices, x, z - 1, x + 1, z - 1, y, texture);
        // Lower face
        (faces & 16) && this.createFloor(vertices, x, z, x + 1, z - 1, y, texture);
        // Upper face
        (faces & 32) && this.createFloor(vertices, x, z, x + 1, z - 1, y + 1, texture);
    }

    // Generate the mesh representing the chunk
    chunkMesh() {
        const vertices = [];
        const dx = this.index[0] * this.size;
        const dz = this.index[1] * this.size;
        for (var i = 0; i < this.data.length; i++) {
            const block = this.data[i];
            const location = block[0];
            const material = block[1];
            const faces = block[2];
            const x = location[0] + dx;
            const y = location[1];
            const z = location[2] + dz;
            this.createBlock(vertices, x, y, z, material, faces);
        }
        return {
            vertices: vertices,
            indices: Array.from(
                new Array(Math.floor(vertices.length / 8)),
                function (x, i) { return i; }
            )
        };
    }
}
