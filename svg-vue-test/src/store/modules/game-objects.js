function getObject(state, id) {
  return state.objects.find(obj => obj.id == id)
}

function updateProperty(state, id, props) {
  let object = state.objects[id]
  Object.assign(object, props)
  state.objects.splice(id, 1, object)
}

export const gameObjects = {
  namespaced: true,
  state: {
    lastIssuedId: -1,
    objects: []
  },
  mutations: {
    add(state, props) {
      let object = Object.assign({
        x: 0,
        y: 0,
        angle: 0,
        bSelected: false,
        bHidden: false,
        bDragOver: false,
        bMoving: false,
        faces: [],
        faceIndex: 0
      }, props)

      object.id = ++state.lastIssuedId
      state.objects.push(object)
    },
    remove(state, {id}) {
      state.objects = state.objects.filter(obj => obj.id != id)
    },
    move(state, {id, x, y}) {
      let object = getObject(state, id)
      updateProperty(state, id, {x: object.x + x, y: object.y + y})
    },
    setPosition(state, {id, x, y}) {
      updateProperty(state, id, {x: x, y: y})
    },
    rotate(state, {id, angle}) {
      let object = getObject(state, id)
      updateProperty(state, id, {angle: object.angle + angle})
    },
    setAngle(state, {id, angle}) {
      updateProperty(state, id, {angle: angle})
    },
    select(state, {id}) {
      console.log(id)
      updateProperty(state, id, {bSelected: true})
    },
    deselect(state, {id}) {
      updateProperty(state, id, {bSelected: false})
    },
    show(state, {id}) {
      updateProperty(state, id, {bHidden: false})
    },
    hide(state, {id}) {
      updateProperty(state, id, {bHidden: true})
    },
    setFace(state, {id, faceIndex}) {
      updateProperty(state, id, {faceIndex: faceIndex})
    },
  },
  getters: {
    getAll: state => {
      return state.objects
    },
    getShown: state => {
      return state.objects.filter(obj => !obj.bHidden)
    },
    getHidden: state => {
      return state.objects.filter(obj => obj.bHidden)
    },
    getSelected: state => {
      return state.objects.filter(obj => obj.bSelected)
    },
    getUnselected: state => {
      return state.objects.filter(obj => !obj.bSelected)
    },
    getById: state => (id) => {
      return getObject(state, id)
    },
    getCurrentFaceById: state => (id) => {
      let object = getObject(state, id)
      return object.faces[object.faceIndex]
    },
    getWidthById: state => (id) => {
      let object = getObject(state, id)
      return object.faces[object.faceIndex].width
    },
    getHeightById: state => (id) => {
      let object = getObject(state, id)
      return object.faces[object.faceIndex].height
    },
  }
}
