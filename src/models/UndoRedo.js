export class UndoRedo {
  constructor(state) {
		this.previous = []
		//this.present = state
		this.next = []
  }

	save = (state) => {
		//console.log(state)
		const clonedState = JSON.parse(JSON.stringify(state));
		//console.log(clonedState)
		this.previous.push(clonedState);
		this.next = [];
	}

	undo = (state) => {
		this.next.push(state)
		return this.previous.pop()
	}

	redo = (state) => {
		this.previous.push(state)
		return this.next.pop()
	}

}




/*=====*/
export const ADD_2D_VIDEO_OBJECT = 'Add Object'
export const DELETE_2D_VIDEO_OBJECT = 'Delete Object'
export const SPLIT_2D_VIDEO_OBJECT = 'Split Object'
export const EXIT_2D_VIDEO_OBJECT = 'Object Exit'
