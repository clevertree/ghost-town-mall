window.engine = (function () {
    // Engine object manages the game engine
    var Engine = {
        FRAME_LIMIT: 60
    };

    var elmCanvas = [];     // List of available canvas elements
    var glContext;          // Current webGL context
    var fragmentShader;     // Fragment Shader
    var vertexShader;       // Vertex Shader
    var shaderProgram;      // Shader Program
    
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();

    var lastTime = null;    // Last render time
    Engine.render = function(t) {
        // Calculate Duration since last render
        var duration = lastTime ? t - lastTime : 0;

        // Calculate FPS
        //var fps = (1000/duration).toFixed(2);
        //console.log("Render", fps+'fps', (t/1000).toFixed(2)+'s');

        var gl = Engine.getGLContext();

        // Set Viewport dimensions
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear frame buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set perspective
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);

        // Render all objects

        // Request the next animation frame
        lastTime = t;
        window.requestAnimationFrame(Engine.render);
    };

    Engine.addShaderScript = function (scriptElm) {
        var gl = this.getGLContext();

        var str = "";
        var k = scriptElm.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        console.info("Loading and compiling Shader", scriptElm.type);
        if (scriptElm.type == "x-shader/x-fragment") {
            fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, str);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
                throw new Error(gl.getShaderInfoLog(fragmentShader));

        } else if (scriptElm.type == "x-shader/x-vertex") {
            vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, str);
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
                throw new Error(gl.getShaderInfoLog(vertexShader));

        } else {
            throw new Error("Invalid Shader Script Type: " + scriptElm.type);
        }


        if (fragmentShader && vertexShader) {
            console.info("Initializing Shaders");

            shaderProgram = glContext.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
                throw new Error("Could not initialise shaders");

            gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        }
    };

    Engine.addCanvas = function (canvas) {
        if (!canvas)
            throw new Error("Invalid canvas element");
        elmCanvas.push(canvas);
    };

    Engine.getGLContext = function () {
        if (glContext)
            return glContext;

        for(var i = 0; i < elmCanvas.length; i++) {
            if(glContext)
                break;
            var canvas = elmCanvas[i];
            glContext = canvas.getContext("experimental-webgl");
        }

        if(!glContext)
            throw new Error("Could not initialise WebGL, sorry :-(");

        return glContext;
    };

    return Engine;
})();

