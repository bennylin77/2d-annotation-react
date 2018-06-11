export class UndoState {
  constructor(props) {
    this.type = props.type;
    this.id = props.id;
		this.attrs = props.attrs;
  }
}




/*=====*/
export const ADD_2D_VIDEO_OBJECT = 'Add Object'
export const DELETE_2D_VIDEO_OBJECT = 'Delete Object'
export const SPLIT_2D_VIDEO_OBJECT = 'Split Object'
export const EXIT_2D_VIDEO_OBJECT = 'Object Exit'
