<template>
  <g :key="id" 
    :transform="transform"
    :filter="$data.$_bDragOver?'url(#myFilter2)':null"
    @mousedown.exact.prevent ="moveStart()"
    @touchstart.exact.prevent ="moveStart()"
    @mousedown.shift.prevent ="toggleSelect()"
    @mousedown.ctrl.prevent ="{if(bSelected){flipSetected()}}"
    @mousedown.alt.prevent ="{if(bSelected){rotateSetected({angle: 10})}}"
    @mouseenter.prevent ="dragEnter()"
    @mouseleave.prevent ="dragLeave()"
    @contextmenu.prevent >
    <transition name="slide-fade">
      <GameImage :key ="faceIndex" v-bind ="currentFace"
        :enablePointerEvent ="!$data.$_bMoving"/>
    </transition>
    <g>
      <circle :cx="width" cy="0" r="10" stroke="none" fill="#555555">
      </circle>
      <text :x="width" y="0" fill="#DDDDDD" font-weight="bold" font-family="Verdana" font-size="12" text-anchor = "middle" dominant-baseline = "central">
        5
      </text>
    </g>
  </g>
</template>

<script>
import GameImage from './GameImage.vue'
import { mapMutations } from 'vuex'

/*function hoge(computed, args) {
  let res = {}
  Object.entries(computed).forEach(function ([key, val]) {
    res[key] = function () { return val.call(this, state, getters, ...args) }
  })
  return res
}*/

export default {
  name: 'GameObject',
  components: {
    GameImage
  },
  props: {
    id: {
      type: Number,
      required: true
    },
  },
  computed: {
    object: function () {
      return this.$store.getters['gameObjects/getById'](this.id)
    },
    x: function () {
      return this.object.x
    },
    y: function () {
      return this.object.y
    },
    angle: function () {
      return this.object.angle
    },
    bSelected: function () {
      return this.object.bSelected
    },
    faces: function () {
      return this.object.faces
    },
    faceIndex: function () {
      return this.object.faceIndex
    },
    currentFace: function () {
      return this.$store.getters['gameObjects/getCurrentFaceById'](this.id)
    },
    width: function () {
      return this.$store.getters['gameObjects/getWidthById'](this.id)
    },
    height: function () {
      return this.$store.getters['gameObjects/getHeightById'](this.id)
    },
    // trasformプロパティ
    transform: function () {
      return 'translate(' + [this.$data.$_x, this.$data.$_y].join(' ') + ') rotate(' + [this.angle, this.width/2, this.height/2].join(' ') + ')'
      //return 'translate(' + [this.x, this.y].join(' ') + ') rotate(' + [this.angle, this.width/2, this.height/2].join(' ') + ')'
    },
  },
  data: function () {
    return {
      $_x: 0,
      $_y: 0,
      $_angle: 0,
      $_bDragOver: false,
      $_bMoving: false,
      $_longTaptimer: null,
    } 
  },
  // マウス操作関連
  mounted: function () {
    console.log('MOUNT LISTENER ON: ' + this.id + ' [' + this.x + ':' + this.y + ']')
    if (this.bSelected) {
      this.$parent.reigisterSelectedComponent(this)
    }

    this.$data.$_x = this.x
    this.$data.$_y = this.y
    this.$data.$_angle = this.angle    
  },
  beforeDestroy: function () {
    console.log('MOUNT LISTENER OFF: ' + this.id + ' [' + this.$data.$_x + ':' + this.$data.$_y + ']')
    if (this.bSelected) {
      this.$parent.unregisterSelectedComponent(this)
    }
    this.setPosition(this.$data.$_x, this.$data.$_y)
    this.setAngle(this.$data.$_angle)
    this.clearLongTap()
  },
  methods: {
    ...mapMutations('gameObjects', {
      setPosition: function (commit, x, y) { commit('setPosition', {id: this.id, x, y}) },
      rotate: function (commit, angle) { commit('rotate', {id: this.id, angle}) },
      rotateSetected: 'rotateSetected',
      setAngle: function (commit, angle) { commit('setAngle', {id: this.id, angle}) },
      select: function (commit) { commit('select', {id: this.id})},
      deselect: function (commit) { commit('deselect', {id: this.id}) },
      show: function (commit) { commit('show', {id: this.id}) },
      hide: function (commit) { commit('hide', {id: this.id}) },
      setFace: function (commit, index) { commit('setFace', {id: this.id, index}) },
      flip: function (commit) { commit('flip', {id: this.id}) },
      flipSetected: 'flipSetected'
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
      //document.addEventListener('mousemove', function (e) {console.log(e.x + ':' + e.y)})
    },
    // move中は前回まで動かした差分を取りながら座標を変化させていく
    move(dx, dy) {
      let tx = dx + this.$data.$_x
      let ty = dy + this.$data.$_y
      if (!tx) tx = dx
      if (!ty) ty = dy
      if (tx > 10 - this.width) this.$data.$_x = tx
      if (ty > 10 - this.height) this.$data.$_y = ty
      //console.log(dx + ':' + dy)
      //console.log(this.$data.$_x + ':' + this.$data.$_y)
    },
    // マウスのクリックが終わった段階で初期化
    moveEnd() {
      this.$data.$_bMoving = false
      this.clearLongTap()
    }
  }
}
</script>
