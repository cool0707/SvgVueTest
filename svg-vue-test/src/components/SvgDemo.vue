<template>
  <div class="container">
    <!-- SVG定義 -->
    <svg :width="width" :height="height" :viewBox="viewport" @wheel="zoompan">
      <rect :width="width" :height="height" x="0" y="0" fill="#225511" />
      <g v-for="(o, idx) in objects" :key="idx" :transform="o.transform" @mousedown.exact="move($event, idx)" @mousedown.ctrl="flipCard($event, idx)">
        <image xlink:href="http://blog-imgs-42.fc2.com/p/i/p/piposozai/cardss.png"
          preserveAspectRatio="none"
          :clip-path="o.clipPath"
          :x="o.x" :y="o.y" :width="o.w" :height="o.h" />
      </g>
      <!-- top right bottom left clip-path="inset(25% 73.33333% 50% 20%)" -->
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
      objects: []
    } 
  },
  // マウス操作関連
  mounted () {
    console.log('MOUNT LISTENER ON')
    document.addEventListener('mouseup', this.mouseUp)
    document.addEventListener('mousemove', this.mouseMove)

    let w = 1200
    let h = 400

    let cols = 15
    let rows = 4

    let cellW = w / cols
    let cellH = h / rows

    for (let i=0; i<cols; i++) {
      for (let j=0; j<rows; j++) {
        this.objects.push({
          x: -cellW * i,
          y: -cellH * j,
          x1: -cellW * i,
          y1: -cellH * j,
          x2: -cellW * (cols - 1),
          y2: -cellH * (rows - 1),
          w: w,
          h: h,
          tx: 0,
          ty: 0,
          transform: 'translate(0 0)',
          bReverse: false,
          clipPath: 'inset(' + [cellH * j, cellW * (cols - i - 1), cellH * (rows - j - 1), cellW * i].join(' ') + ')',
          clipPath1: 'inset(' + [cellH * j, cellW * (cols - i - 1), cellH * (rows - j - 1), cellW * i].join(' ') + ')',
          clipPath2: 'inset(' + [cellH * (rows - 1), 0, 0, cellW * (cols - 1)].join(' ') + ')'
        })
      }
    }
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
      var tempX = dx + Number(this.objects[this.selectIdx].tx)
      var tempY = dy + Number(this.objects[this.selectIdx].ty)
      if (tempX > 0) this.objects[this.selectIdx].tx = tempX
      if (tempY > 0) this.objects[this.selectIdx].ty = tempY
      this.objects[this.selectIdx].transform = 'translate('+ this.objects[this.selectIdx].tx + ' ' +  this.objects[this.selectIdx].ty + ')'
      e.preventDefault()
    },
    flipCard (e, i) {
      if (this.objects[i].bReverse) {
        this.objects[i].x = this.objects[i].x1
        this.objects[i].y = this.objects[i].y1
        this.objects[i].clipPath = this.objects[i].clipPath1
      } else {
        this.objects[i].x = this.objects[i].x2
        this.objects[i].y = this.objects[i].y2
        this.objects[i].clipPath = this.objects[i].clipPath2
      }
      this.objects[i].bReverse = !this.objects[i].bReverse
    }
  }
}
</script>
