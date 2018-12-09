class Player {
    constructor(id, position, velocity, acceleration) {
        this.id = id;
        this.position = position;
    }

    static getMesh() {
        const R = 1.0;
        const vertices = [

            // +Z face
            -R, -R, R,  0.0, 0.0,
             R,  R, R,  1.0, 1.0,
            -R,  R, R,  0.0, 1.0,
            -R, -R, R,  0.0, 0.0,
             R, -R, R,  1.0, 0.0,
             R,  R, R,  1.0, 1.0,

            // -Z face
            -R, -R, -R, 0.0, 0.0,
            -R,  R, -R, 0.0, 1.0,
             R,  R, -R, 1.0, 1.0,
            -R, -R, -R, 0.0, 0.0,
             R,  R, -R, 1.0, 1.0,
             R, -R, -R, 1.0, 0.0,

            // +X face
            R, -R,  R, 0.0, 0.0,
            R,  R, -R, 1.0, 1.0,
            R,  R,  R, 0.0, 1.0,
            R, -R,  R, 0.0, 0.0,
            R, -R, -R, 1.0, 0.0,
            R, R,  -R, 1.0, 1.0,

            // -X face
            -R, -R,  R, 0.0, 0.0,
            -R,  R,  R, 0.0, 1.0,
            -R,  R, -R, 1.0, 1.0,
            -R, -R,  R, 0.0, 0.0,
            -R, R,  -R, 1.0, 1.0,
            -R, -R, -R, 1.0, 0.0,

            // +Y face
            -R, R,  R, 0.0, 0.0,
             R, R, -R, 1.0, 1.0,
            -R, R, -R, 0.0, 1.0,
            -R, R,  R, 0.0, 0.0,
             R, R,  R, 1.0, 0.0,
             R, R, -R, 1.0, 1.0,

             // -Y face
            -R, -R,  R, 0.0, 0.0,
            -R, -R, -R, 0.0, 1.0,
             R, -R, -R, 1.0, 1.0,
            -R, -R,  R, 0.0, 0.0,
             R, -R, -R, 1.0, 1.0,
             R, -R,  R, 1.0, 0.0,
        ];

        const indices = [
            0, 1, 2, 3, 4, 5,
            6, 7, 8, 9, 10, 11,
            12, 13, 14, 15, 16, 17,
            18, 19, 20, 21, 22, 23,
            24, 25, 26, 27, 28, 29,
            30, 31, 32, 33, 34, 35
        ];

        return {
            vertices: vertices,
            indices: indices
        };
    }

    getModelMatrix() {
        const t = vec3.fromValues(this.position[0], this.position[1], this.position[2]);  
        const T = mat4.create();
        mat4.fromTranslation(T, t);
        return T;
    }
}
