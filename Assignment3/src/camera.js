class Camera {
	constructor() {
		this.fov = 60;
		// this.eye = new Vector3([0, -.75, -20]);
		// this.at = new Vector3([0, 0, 1]);
		// this.up = new Vector3([0, .25, 0]);
		this.eye = new Vector3([0,0,3]);
		this.at = new Vector3([0,0,-100]);
		this.up = new Vector3([0,1,0]);
		// var g_eye = [0,0,3];
		// var g_at = [0,0,-100];
		// var g_up = [0,1,0];
		this.viewMat = new Matrix4();
		this.viewMat.setLookAt(
			this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
			this.at.elements[0], this.at.elements[1], this.at.elements[2],
			this.up.elements[0], this.up.elements[1], this.up.elements[2]
		);
		this.projMat = new Matrix4();
		this.projMat.setPerspective(
			this.fov, canvas.width / canvas.height, 1, 100
		);
	}

	renderCamera() {
		this.viewMat.setLookAt(
			this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
			this.at.elements[0], this.at.elements[1], this.at.elements[2],
			this.up.elements[0], this.up.elements[1], this.up.elements[2]
		);
	}

	moveForward() {
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);
		f.normalize();
		f.mul(0.5);
		this.eye.add(f);
		this.at.add(f);
		this.renderCamera();
	}

	moveBackward() {
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);
		f.normalize();
		f.mul(0.5);
		this.eye.sub(f);
		this.at.sub(f);
		this.renderCamera();
	}

	moveLeft() {
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);
		f.normalize();
		let s = new Vector3();
		s = Vector3.cross(this.up, f);
		s.normalize();
		s.mul(0.5);
		this.eye.add(s);
		this.at.add(s);
		this.renderCamera();
	}

	moveRight() {
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);
		f.normalize();

		let s = new Vector3();
		s = Vector3.cross(f, this.up);
		s.normalize();
		s.mul(0.5);
		this.eye.add(s);
		this.at.add(s);
		this.renderCamera();
	}

	panLeft() {
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);

		let rotationMatrix = new Matrix4().setRotate(3, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
		let f_prime = rotationMatrix.multiplyVector3(f);
		this.at.set(this.eye);
		this.at.add(f_prime);
		this.renderCamera();
	}

	panRight() {
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);

		let rotationMatrix = new Matrix4().setRotate(-3, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
		let f_prime = rotationMatrix.multiplyVector3(f);
		this.at.set(this.eye);
		this.at.add(f_prime);
		this.renderCamera();
	}
}