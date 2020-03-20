<template>
  <div class="container">
    <!-- SVG定義 -->
    <svg :width="width" :height="height" :viewBox="viewport" @wheel="zoompan">
      <rect v-for="(r, idx) in rects" :key="idx"
        @mousedown="move($event, idx)"
        :fill="r.color"
        :x="r.x" :y="r.y" :width="r.w" :height="r.h">
      </rect>
    </svg>
  </div>
</template>

<script>
export default {
    name: 'SVGDemo',
    props: {
        width: Number,
        height: Number
    },
  data () {
    return {
      ratio: 1,
      dx: 0,
      dy: 0,
      viewport: [0, 0, this.width, this.height].join(' '),
      isMove: false,
      beforeMouseX: null,
      beforeMouseY: null,
      selectIdx: 0,
      rects: [
        {
          x: 10,
          y: 10,
          w: 100,
          h: 100,
          color: 'green'
        },
        {
          x: 200,
          y: 150,
          w: 100,
          h: 100,
          color: 'red'
        },
        {
          x: 310,
          y: 410,
          w: 200,
          h: 100,
          color: 'blue'
        },
        {
          x: 410,
          y: 200,
          w: 50,
          h: 50,
          color: 'yellow'
        }
      ]
    } 
  },
  // マウス操作関連
  mounted () {
    console.log('MOUNT LISTENER ON')
    document.addEventListener('mouseup', this.mouseUp)
    document.addEventListener('mousemove', this.mouseMove)
  },
  beforeDestroy () {
    console.log('MOUNT LISTENER OFF')
    document.removeEventListener('mouseup', this.mouseUp)
    document.removeEventListener('mousemove', this.mouseMove)
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
    // 図形を動かすフラグを立てる
    move (e, i) {
      this.isMove = true
      this.selectIdx = i
      e.preventDefault()
    },
    // マウスのクリックが終わった段階で初期化
    mouseUp (e) {
      this.isMove = false
      this.beforeMouseX = null
      this.beforeMouseY = null
      e.preventDefault()
    },
    // move中は前回まで動かした差分を取りながら座標を変化させていく
    mouseMove (e) {
      if (!this.isMove) return
      var mouseX = e.offsetX * this.ratio + this.dx
      var mouseY = e.offsetY * this.ratio + this.dy
      var dx = 0
      var dy = 0
      if (this.beforeMouseX && this.beforeMouseY) {
          dx = mouseX - this.beforeMouseX
          dy = mouseY - this.beforeMouseY
      }
      this.beforeMouseX = mouseX
      this.beforeMouseY = mouseY
      var tempX = dx + Number(this.rects[this.selectIdx].x)
      var tempY = dy + Number(this.rects[this.selectIdx].y)
      if (tempX > 0) this.rects[this.selectIdx].x = tempX
      if (tempY > 0) this.rects[this.selectIdx].y = tempY
      e.preventDefault()
    }
  }
}
</script>
