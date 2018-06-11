export class VideoObject {
  constructor({name, color, trajectories, children = [], parent = ''}) {
    this.name = name;
    this.color = color;
		this.trajectories =  trajectories;
		this.children = children;
		this.parent = parent;
  }
}

export class Trajectory{
	constructor({x, y, width, height, time, status= SHOW}) {
    this.x = x;
    this.y = y;
		this.width = width;
		this.height = height;
		this.time = time;
		this.status = status;
  }
}
export const SHOW = 'Show'
export const HIDE = 'Hide'
export const SPLITED = 'Splited'
