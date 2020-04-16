function getObject(state, id) {
  return state.objects.find(obj => obj.id == id)
}

function updateProperty(state, id, props) {
  delete props.id
  state.objects = state.objects.map(obj => {
    if (obj.id == id) {
      Object.assign(obj, props)
    }
    return obj
  })
}

function arrayShuffle([...arr]) {
  let j = arr.length;
  while (j) {
    const i = Math.floor(Math.random() * j--);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
  return arr;
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
        bDragging: false,
        faces: [],
        faceIndex: 0
      }, props)

      object.id = Number(++state.lastIssuedId)
      state.objects.push(object)
    },
    remove(state, {id}) {
      state.objects = state.objects.filter(obj => obj.id != id)
    },
    move(state, {id, x, y}) {
      let object = getObject(state, id)
      updateProperty(state, id, {x: object.x + x, y: object.y + y})
    },
    moveSetected(state, {x, y}) {
      state.objects = state.objects.map(object => {
        if (object.bSelected) {
          object.x += x
          object.y += y
        }
        return object
      })
    },
    setPosition(state, {id, x, y}) {
      updateProperty(state, id, {x: x, y: y})
    },
    rotate(state, {id, angle}) {
      let object = getObject(state, id)
      updateProperty(state, id, {angle: object.angle + angle})
    },
    rotateSetected(state, {angle}) {
      state.objects = state.objects.map(object => {
        if (object.bSelected) {
          object.angle += angle
        }
        return object
      })
    },
    setAngle(state, {id, angle}) {
      updateProperty(state, id, {angle: angle})
    },
    select(state, {id}) {
      updateProperty(state, id, {bSelected: true})
    },
    deselect(state, {id}) {
      updateProperty(state, id, {bSelected: false})
    },
    setSelected(state, {id,bSelected}) {
      updateProperty(state, id, {bSelected: bSelected})
    },
    setDragging(state, {id, bDragging}) {
      console.log('DRAG!!!!! ' + bDragging)
      updateProperty(state, id, {bDragging: bDragging})
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
    flip(state, {id}) {
      let object = getObject(state, id)
      updateProperty(state, id, {faceIndex: (object.faceIndex + 1) % object.faces.length})
    },
    flipSetected(state) {
      state.objects = state.objects.map(object => {
        if (object.bSelected) {
          object.faceIndex = (object.faceIndex + 1) % object.faces.length
        }
        return object
      })
    },
    releaseSetected(state) {
      state.objects.sort((obj1, obj2) => {
        if (obj1.bSelected && !obj2.bSelected) {
          return 1
        } else if (!obj1.bSelected && obj2.bSelected) {
          return -1
        } else {
          return 0
        }
      })
      state.objects = state.objects.map( obj => {
        obj.bSelected = false
        return obj
      })
    },
    shuffle(state) {
      state.objects = arrayShuffle(state.objects)
    }
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
