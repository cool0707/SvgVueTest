<template>
  <g :key="id" 
    :transform="transform"
    :filter="$data.$_bDragOver?'url(#myFilter2)':null"
    @mousedown.exact.prevent ="moveStart()"
    @touchstart.exact.prevent ="moveStart()"
    @mousedown.shift.prevent ="toggleSelect()"
    @mousedown.ctrl.prevent ="flip()"
    @mouseenter.prevent ="dragEnter()"
    @mouseleave.prevent ="dragLeave()"
    @contextmenu.prevent >
    <transition v-for="(f, fIdx) in $data.$_faces" :key="fIdx" name="slide-fade">
      <image v-if="faceIndex == fIdx"
        preserveAspectRatio="none"
        :xlink:href ="f.image"
        :style ="{
          transformOrigin: (f.w / 2) + 'px ' + (f.h / 2) + 'px',
          pointerEvents: $data.$_bMoving ? 'none' : 'auto'}"     
        :clip-path ="f.clipPath"
        :x ="f.x" :y ="f.y" :width="f.imageWidth" :height="f.imageHeight" />
    </transition>
  </g>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'GameObject',
  props: {
    id: {
      type: Number,
      required: true
    },
  },
  computed: {
    ...mapState('gameObjects', {
      x: function(state) { return state.objects[this.id].x },
      y: function(state) { return state.objects[this.id].y },
      angle: function(state) { return state.objects[this.id].angle },
      bSelected: function(state) { return state.objects[this.id].bSelected },
      faces: function(state) { return state.objects[this.id].faces },
      faceIndex: function(state) { return state.objects[this.id].faceIndex }
    }),
    ...mapGetters('gameObjects', {
      _currentFace: 'getCurrentFaceById',
      _width: 'getWidthById',
      _height: 'getHeightById',
    }),
    // trasformプロパティ
    transform: function () {
      return 'translate(' + [this.$data.$_x, this.$data.$_y].join(' ') + ') rotate(' + [this.angle, this.width/2, this.height/2].join(' ') + ')'
    },
    width: function () {
      return this.$data.$_faces.length ? this.$data.$_faces[this.faceIndex].w : 0
    },
    height: function () {
      return this.$data.$_faces.length ? this.$data.$_faces[this.faceIndex].h : 0
    }
  },
  data: function () {
    return {
      $_x: this.x,
      $_y: this.y,
      $_angle: this.angle,
      $_faces: [],
      $_bDragOver: false,
      $_bMoving: false,
      $_longTaptimer: null,
    } 
  },
  // マウス操作関連
  mounted: function () {
    console.log('MOUNT LISTENER ON: ' + this.id)
    this.$_faces = []
    this.faces.forEach((i) => {
      this.$data.$_faces.push({
        w: i.width,
        h: i.height,
        x: -i.width * i.col,
        y: -i.height * i.row,
        image: i.source,
        imageWidth: i.width * i.colSize,
        imageHeight: i.height * i.rowSize,
        clipPath: 'inset(' + [i.height * i.row, i.width * (i.colSize - i.col - 1), i.height * (i.rowSize - i.row - 1), i.width * i.col].join(' ') + ')',
      })
    })
  },
  beforeDestroy: function () {
    console.log('MOUNT LISTENER OFF')
    this.clearLongTap()
  },
  methods: {
    ...mapMutations('gameObjects', {
      setPosition: function (commit, pos) { commit('setPosition', {id: this.id, ...pos}) },
      rotate: function (commit, pos) { commit('rotate', {id: this.id, ...pos}) },
      setAngle: function (commit, pos) { commit('setAngle', {id: this.id, ...pos}) },
      select: function (commit) { 
        commit('select', {id: this.id})
      },
      deselect: function (commit, pos) { commit('deselect', {id: this.id, ...pos}) },
      show: function (commit, pos) { commit('show', {id: this.id, ...pos}) },
      hide: function (commit, pos) { commit('hide', {id: this.id, ...pos}) },
      setFace: function (commit, pos) { commit('setFace', {id: this.id, ...pos}) }
    }),
    dragEnter() {
      //if (this.isMove) {
        console.log('enter')
        this.$data.$_bDragOver = true
        this.startLongTap()
      //}
    },
    dragLeave() {
      //if (this.isMove) {
        this.$data.$_bDragOver = false
        this.clearLongTap()
      //}
    },
    startLongTap() {
      this.$data.$_longTaptimer = window.setTimeout(this.onLongTap, 800)
    },
    clearLongTap() {
      if (this.$data.$_longTaptimer) {
        window.clearTimeout(this.$data.$_longTaptimer)
        this.$data.$_longTaptimer = null
      }
    },
    onLongTap() {
      console.log('tap')
    },
    toggleSelect() {
      this.$data.$_bSelected = !this.$data.$_bSelected
    },
    // 図形を動かすフラグを立てる
    moveStart() {
      if (!this.$data.$_bSelected) {
        this.select()
      }
      console.log('moveStart')
      this.$data.$_bMoving = true
      this.$parent.addMovingObject(this.move, this.moveEnd)
      //document.addEventListener('mousemove', function (e) {console.log(e.x + ':' + e.y)})
    },
    // move中は前回まで動かした差分を取りながら座標を変化させていく
    move(dx, dy) {
      let tx = dx + Number(this.$_x)
      let ty = dy + Number(this.$_y)
      if (tx > 10 - this.width) this.$_x = tx
      if (ty > 10 - this.height) this.$_y = ty
    },
    // マウスのクリックが終わった段階で初期化
    moveEnd() {
      this.$data.$_bMoving = false
      this.clearLongTap()
    },
    flip() {
      this.$data.$_faceIndex = (this.$data.$_faceIndex + 1) % this.$data.$_faces.length
      this.$data.$_bReverse = !this.$data.$_bReverse
    }
  }
}
</script>
