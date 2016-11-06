window.engine = (function(){
	var elmCanvas = [];
	var glContext;
	var fragmentShader;
	var vertexShader;
	var shaderProgram;

	function engine() {

	}

	engine.prototype.addCanvas = function(canvas) {
		if(!canvas)
			throw new Error("Invalid canvas element");
		elmCanvas.push(canvas);
	};

	engine.prototype.getGLContext = function() {
		if(glContext)
			return glContext;

		for(var i=0; i<elmCanvas.length; i++) {
			var canvas = elmCanvas[i];				
	            	glContext = canvas.getContext("experimental-webgl");
        	    // viewportWidth = canvas.width;
	            // viewportHeight = canvas.height;
			return glContext;
		}

		throw new Error("Could not initialise WebGL, sorry :-(");		
	}

	engine.prototype.addShaderScript = function(scriptElm) {
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


		if(fragmentShader && vertexShader) {
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
	}

	return new engine();
})();

