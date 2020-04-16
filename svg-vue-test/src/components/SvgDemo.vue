<template>
  <div class="container"
    @mousedown.prevent="mouseDown($event)" @mouseup.prevent="mouseUp($event)" @mousemove.prevent="mouseMove($event)"
    @touchstart.prevent="mouseDown($event)" @touchend.prevent="mouseUp($event)" @touchmove.prevent="mouseMove($event)">
    <!-- SVG定義 -->
    <svg :width="width" :height="height" :viewBox="viewport" @wheel="zoompan">
      <filter id="myFilter" filterUnits="userSpaceOnUse" x="-5" y="-5">
        <!-- 薄い灰色で領域を塗りつぶす。このレイヤーには「COLOR」と名前をつける -->
        <feFlood flood-color="#ffbb00" />
        <feComposite in2="SourceAlpha" operator="in" result="BorderColor" />

        <feFlood flood-color="#000000" flood-opacity="0.8" />
        <feComposite in2="SourceAlpha" operator="in" result="ShadowColor" />
        
        <feOffset in="BorderColor" dx="2" dy="2" result="Border1" />
        <feOffset in="BorderColor" dx="2" dy="-2" result="Border2" />
        <feOffset in="BorderColor" dx="-2" dy="2" result="Border3" />
        <feOffset in="BorderColor" dx="-2" dy="-2" result="Border4" />
        
        <feMerge result="Border">
          <feMergeNode in="Border1" />
          <feMergeNode in="Border2" />
          <feMergeNode in="Border3" />
          <feMergeNode in="Border4" />
        </feMerge>

        <feOffset in="ShadowColor" dy="5" />
        <feGaussianBlur stdDeviation="10" result="DropShadow" />
        
        <feMerge>
            <feMergeNode in="Border"></feMergeNode>
            <feMergeNode in="DropShadow"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
      <filter id="myFilter2" filterUnits="userSpaceOnUse">
        <!-- 薄い灰色で領域を塗りつぶす。このレイヤーには「COLOR」と名前をつける -->
        <feFlood flood-color="#ffbb00" flood-opacity="0.5" result="COLOR"></feFlood>
        <feComposite in="COLOR" in2="SourceAlpha" operator="in" result="SHADOW"></feComposite>
        <feMerge>
          <feMergeNode in="SourceGraphic"></feMergeNode>
          <feMergeNode in="SHADOW"></feMergeNode>
        </feMerge>
      </filter>
      <rect :width="width" :height="height" x="0" y="0" fill="#225511"
        @mousedown.exact.prevent="clearSelect()"
        @mousedown.ctrl.prevent="shuffle()"
        @contextmenu.prevent />
      <GameObject v-for="(o) in unselected" :key="o.id" :a="o.id" :id="Number(o.id)" />
      <g filter="url(#myFilter)">
        <GameObject v-for="(o) in selected" :key="o.id" :a="o.id" :id="Number(o.id)" />
      </g>
      <!-- top right bottom left clip-path="inset(25% 73.33333% 50% 20%)" -->
    </svg>
  </div>
</template>

<script>
import GameObject from './GameObject.vue'
import { mapMutations, mapGetters } from 'vuex'

export default {
  name: 'SVGDemo',
  props: {
      width: Number,
      height: Number
  },
  components: {
    GameObject
  },
  provide: function () {
    return {
      startMove: this.startMove
    }
  },
  data: function () {
    return {
      ratio: 1,
      dx: 0,
      dy: 0,
      viewport: [0, 0, this.width, this.height].join(' '),
      isMove: false,
      beforeMouseX: null,
      beforeMouseY: null,
      lastTouchElement: null,
      timer: null,
      selectedComponent: [],
      timeTotal: []
    } 
  },
  computed: {
    ...mapGetters('gameObjects', {
      all: 'getAll',
      shown: 'getShown',
      hidden: 'getHidden',
      selected: 'getSelected',
      unselected: 'getUnselected',
      getById: 'getById'
    })
  },
  // マウス操作関連
  mounted: function () {
    console.log('MOUNT LISTENER ON')
    //document.addEventListener('mouseup', this.mouseUp)
    //document.addEventListener('mousemove', this.mouseMove)

    let w = 80
    let h = 100

    let cols = 15
    let rows = 4

    for (let i=0; i<5; i++) {
      for (let j=0; j<2; j++) {
        this.add({
          x: 0,
          y: 2,
          faces: [
          {
            source: 'https://blog-imgs-42.fc2.com/p/i/p/piposozai/cardss.png',
            height: h,
            width: w,
            rowCount: rows,
            columnCount: cols,
            row: j,
            column: i
          },
          {
            source: 'https://blog-imgs-42.fc2.com/p/i/p/piposozai/cardss.png',
            height: h,
            width: w,
            rowCount: rows,
            columnCount: cols,
            row: rows - 1,
            column: cols - 1
          }
        ]})
      }
    }

    // 選択状態配列を更新
    //this.updateSelect()
  },
  beforeDestroy: function () {
    console.log('MOUNT LISTENER OFF')
    //document.removeEventListener('mouseup', this.mouseUp)
    //document.removeEventListener('mousemove', this.mouseMove)
    this.clearLongTap()
  },
  methods: {
    ...mapMutations('gameObjects', [
      'add',
      'remove',
      'moveSetected',
      'shuffle'
    ]),
    zoompan (e) {
      var [x, y, w, h] = this.viewport.split(' ').map(v => parseFloat(v))
      if (e.ctrlKey) {
        // 拡大（Y軸が上がる場合） 縮小（Y軸が下がる場合）
        if (e.deltaY > 0) {
           w = w * 1.01
           h = h * 1.01
        } else {
          w = w * 0.99
          h = h * 0.99
        }
        this.makeViewBox(x, y, w, h)
        this.ratio = w / this.width
        e.preventDefault()
      } else if (e.altKey) {
        for(let obj of this.selected) {
          obj.angle = (e.deltaY * 0.1 + Number(obj.angle) + 360) % 360
        }
      } else {
        // 移動
        if ((this.dx + e.deltaX > -this.width && this.dy + e.deltaY > -this.width) &&
            (this.dx + e.deltaX < this.width * 2 && this.dy + e.deltaY < this.width * 2)) {
          this.makeViewBox(x + e.deltaX, y + e.deltaY, w, h)
          this.dx += e.deltaX
          this.dy += e.deltaY
        }
      }
    },
    // viewboxを作成
    makeViewBox(x, y, w, h) {
      this.viewport = [x, y, w, h].join(' ')
    },
    clearSelect() {
      /*this.selected.forEach(o => {
        this.$store.commit('gameObjects/deselect', {id: o.id})
      })*/
      this.$store.commit('gameObjects/releaseSetected')
    },
    // 図形を動かすフラグを立てる
    mouseDown() {
      this.isMove = true
    },
    // マウスのクリックが終わった段階で初期化
    mouseUp() {
      this.isMove = false
      if (this.beforeMouseX && this.beforeMouseY) {
        this.beforeMouseX = null
        this.beforeMouseY = null
      }

      // デバッグ用
      if (this.timeTotal.length) {
        console.log(this.timeTotal.reduce((acc, cur) => acc + cur) / this.timeTotal.length)
        this.timeTotal = []
      }

      // 選択オブジェクトごとに移動終了処理を行う
      /*this.movingObjectCallbacks.forEach(o => {
        o.end()
      })
      this.movingObjectCallbacks = []*/
      this.selectedComponent.forEach(c => {
        c.moveEnd()
      })

      // タッチデバイス用にmouseleaveイベントを発火
      if (this.lastTouchElement) {
        let event = document.createEvent("mouseevents")
        event.initEvent("mouseleave", true, true)
        this.lastTouchElement.dispatchEvent(event)
        this.lastTouchElement = null
      }
    },
    reigisterSelectedComponent(comp) {
      console.log('reigisterSelectedComponent')
      this.selectedComponent.push(comp)
    },
    unregisterSelectedComponent(comp) {
      console.log('unreigisterSelectedComponent')
      this.selectedComponent = this.selectedComponent.filter( c => c.id != comp.id)
    },
    // move中は前回まで動かした差分を取りながら座標を変化させていく
    mouseMove (e) {
      if (!this.isMove) return
      let mouseX = 0
      let mouseY = 0

      // 現在マウス位置を取得
      switch (e.type) {
        case 'mousemove':
          mouseX = e.offsetX * this.ratio + this.dx
          mouseY = e.offsetY * this.ratio + this.dy
          break
        case 'touchmove':
          if (e.touches.length) {
            mouseX = e.touches[0].pageX * this.ratio + this.dx
            mouseY = e.touches[0].pageY * this.ratio + this.dy

            // タッチデバイス用にmouseenter、mouseleaveイベントを発火
            if (this.lastTouchElement !== e.touches[0].target) {
              let event = document.createEvent("mouseevents")
              event.initEvent("mouseenter", true, true)
              e.touches[0].target.dispatchEvent(event)

              if (this.lastTouchElement) {
                event = document.createEvent("mouseevents")
                event.initEvent("mouseleave", true, true)
                this.lastTouchElement.dispatchEvent(event)
              }

              this.lastTouchElement = e.touches[0].target
            }
          }
          break
      }

      // マウス位置から差分を取得
      let dx = 0
      let dy = 0
      if (this.beforeMouseX && this.beforeMouseY) {
          dx = mouseX - this.beforeMouseX
          dy = mouseY - this.beforeMouseY
      }

      // マウス位置を保管
      this.beforeMouseX = mouseX
      this.beforeMouseY = mouseY

      const startTime = performance.now() // 開始時間
      // 選択中のコンポーネントを移動させる
      //console.log('mouseMove' + e.type)
      this.selectedComponent.forEach(c => {
        c.move(dx, dy)
      })
      //this.moveSetected({x:dx, y:dy})
      /*this.selected.forEach(o => {
        this.$store.commit('gameObjects/move', {id: o.id, x: dx, y:dy})
      })*/
      const endTime = performance.now() // 終了時間

      this.timeTotal.push(endTime - startTime); // 何ミリ秒かかったかを表示する
    },
  }
}
</script>

<style>
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: rotateY(180deg);
  opacity: 0;
}
</style>