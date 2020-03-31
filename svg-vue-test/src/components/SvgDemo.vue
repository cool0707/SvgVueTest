<template>
  <div class="container"
    @mouseup.prevent="mouseUp($event)" @mousemove.prevent="mouseMove($event)"
    @touchend.prevent="mouseUp($event)" @touchmove.prevent="mouseMove($event)">
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
        @mousedown.exact="clearSelect()"
        @contextmenu.prevent />
      <GameObject v-for="(o) in unselected" :key="o.index" v-bind="o" />
      <g filter="url(#myFilter)">
        <GameObject v-for="(o) in selected" :key="o.index" v-bind="o" />
      </g>
      <!-- top right bottom left clip-path="inset(25% 73.33333% 50% 20%)" -->
    </svg>
  </div>
</template>

<script>
import GameObject from './GameObjectCore.vue'

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
      activeDroppable: null,
      timer: null,
      objects: [],
      selected: [],
      unselected: [],
      movingObjectCallbacks: []
    } 
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

    for (let i=0; i<cols; i++) {
      for (let j=0; j<rows; j++) {
        this.objects.push({
          index: this.objects.length,
          images: [
            {
              source: 'https://blog-imgs-42.fc2.com/p/i/p/piposozai/cardss.png',
              height: h,
              width: w,
              rowSize: rows,
              colSize: cols,
              row: j,
              col: i
            },
            {
              source: 'https://blog-imgs-42.fc2.com/p/i/p/piposozai/cardss.png',
              height: h,
              width: w,
              rowSize: rows,
              colSize: cols,
              row: rows - 1,
              col: cols - 1
            }
          ],
          initX: 0,
          initY: 0,
          initAngle: 0
        })
      }
    }

    // 選択状態配列を更新
    this.updateSelect()
  },
  beforeDestroy: function () {
    console.log('MOUNT LISTENER OFF')
    //document.removeEventListener('mouseup', this.mouseUp)
    //document.removeEventListener('mousemove', this.mouseMove)
    this.clearLongTap()
  },
  methods: {
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
    makeViewBox (x, y, w, h) {
      this.viewport = [x, y, w, h].join(' ')
    },
    dragEnter (i) {
      if (this.isMove) {
        //this.objects[i].bDropping = true
        this.startLongTap(i)
      }
    },
    dragLeave (i) {
      if (this.isMove) {
        this.objects[i].bDropping = false
        this.activeDroppable = null
        this.clearLongTap()
      }
    },
    startLongTap (i) {
      this.timer = window.setTimeout(this.longTap, 800, i)
    },
    clearLongTap () {
      if (this.timer) {
        window.clearTimeout(this.timer)
        this.timer = null
      }
    },
    longTap (i) {
      this.objects[i].bDropping = true
      this.activeDroppable = this.objects[i]
    },
    // 図形を動かすフラグを立てる
    move (i) {
      this.isMove = true

      if (!this.objects[i].bSelected) {
        this.clearSelect()
        this.objects[i].bSelected = true

        // 選択状態配列を更新
        this.updateSelect()
      }
    },
    updateSelect () {
      this.selected = this.objects.filter(o => !o.bHidden && o.bSelected)
      this.unselected = this.objects.filter(o => !o.bHidden && !o.bSelected)
    },
    toggleSelect (i) {
      this.isMove = true

      if (this.objects[i].bSelected) {
        this.objects[i].bSelected = false
      } else {
        this.objects[i].bSelected = true
      }

      // 選択状態配列を更新
      this.updateSelect()
    },
    // マウスのクリックが終わった段階で初期化
    mouseUp () {
      this.isMove = false
      if (this.beforeMouseX && this.beforeMouseY) {
        this.beforeMouseX = null
        this.beforeMouseY = null
      }
      if (this.activeDroppable) {
        this.selected.forEach(o => {
          o.bHidden = true
        })
        this.activeDroppable.bDropping = false
        this.activeDroppable = null
        this.clearSelect()
      }
      this.movingObjectCallbacks.forEach(o => {
        o.end()
      })
      this.movingObjectCallbacks = []
      if (this.lastTouchElement) {
        let event = document.createEvent("mouseevents")
        event.initEvent("mouseleave", true, true)
        this.lastTouchElement.dispatchEvent(event)
        this.lastTouchElement = null
      }
      this.clearLongTap()
    },
    clearSelect () {
      this.selected.forEach(o => o.bSelected = false)
      
      // 選択状態配列を更新
      this.updateSelect()
    },
    addMovingObject (move, moveEnd) {
      console.log('addMovingObject')
      this.movingObjectCallbacks.push({move: move, end:moveEnd})
    },
    // move中は前回まで動かした差分を取りながら座標を変化させていく
    mouseMove (e) {
      //if (!this.isMove || !this.selected) return
      let mouseX = 0
      let mouseY = 0

      switch (e.type) {
        case 'mousemove':
          mouseX = e.offsetX * this.ratio + this.dx
          mouseY = e.offsetY * this.ratio + this.dy
          break
        case 'touchmove':
          if (e.touches.length) {
            mouseX = e.touches[0].pageX * this.ratio + this.dx
            mouseY = e.touches[0].pageY * this.ratio + this.dy

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

      let dx = 0
      let dy = 0
      if (this.beforeMouseX && this.beforeMouseY) {
          dx = mouseX - this.beforeMouseX
          dy = mouseY - this.beforeMouseY
      }
      this.beforeMouseX = mouseX
      this.beforeMouseY = mouseY
      /*this.selected.forEach(o => {
        let tempX = dx + Number(o.x)
        let tempY = dy + Number(o.y)
        if (tempX > 10 - o.w) o.x = tempX
        if (tempY > 10 - o.h) o.y = tempY
      })*/
      console.log('mouseMove' + e.type)
      this.movingObjectCallbacks.forEach(o => {
        o.move(dx, dy)
      })
      //e.preventDefault()
    },
    flipCard (i) {
      if (this.selected) {
        this.selected.forEach(o => {
          o.faceIndex = (o.faceIndex + 1) % o.faces.length
          o.bReverse = !o.bReverse
        })
      } else {
        this.objects[i].faceIndex = (this.objects[i].faceIndex + 1) % this.objects[i].faces.length
        this.objects[i].bReverse = !this.objects[i].bReverse
      }
    }
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