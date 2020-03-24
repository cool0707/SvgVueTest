<template>
  <div class="container">
    <!-- SVG定義 -->
    <svg :width="width" :height="height" :viewBox="viewport" @wheel="zoompan">
      <filter id="myFilter">
        <!-- 薄い灰色で領域を塗りつぶす。このレイヤーには「COLOR」と名前をつける -->
        <feFlood flood-color="#ffbb00" result="COLOR"></feFlood>

        <!-- DROPとCOLORレイヤーを合成し、シャドウに色を付ける。結果には「SHADOW」と名前をつける -->
        <feComposite in="COLOR" in2="SourceAlpha" operator="in" result="SHADOW"></feComposite>

        <!-- SHADOWレイヤーを右下に20ピクセル分ずらす。新しいレイヤーには「DROPSHADOW」と名前をつける -->
        <feOffset in="SHADOW" dx="2" dy="2" result="DROPSHADOW1"></feOffset>

        <!-- SHADOWレイヤーを右下に20ピクセル分ずらす。新しいレイヤーには「DROPSHADOW」と名前をつける -->
        <feOffset in="SHADOW" dx="2" dy="-2" result="DROPSHADOW2"></feOffset>

        <!-- SHADOWレイヤーを右下に20ピクセル分ずらす。新しいレイヤーには「DROPSHADOW」と名前をつける -->
        <feOffset in="SHADOW" dx="-2" dy="2" result="DROPSHADOW3"></feOffset>

        <!-- SHADOWレイヤーを右下に20ピクセル分ずらす。新しいレイヤーには「DROPSHADOW」と名前をつける -->
        <feOffset in="SHADOW" dx="-2" dy="-2" result="DROPSHADOW4"></feOffset>

        <!-- 画像が上にくるように、DROPSHADOWとソース画像を重ね合わせる。（MergeNodeの順番が反映されることを忘れずに） -->
        <feMerge>
            <feMergeNode in="DROPSHADOW1"></feMergeNode>
            <feMergeNode in="DROPSHADOW2"></feMergeNode>
            <feMergeNode in="DROPSHADOW3"></feMergeNode>
            <feMergeNode in="DROPSHADOW4"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
      <rect :width="width" :height="height" x="0" y="0" fill="#225511" />
      <g v-for="(o, oIdx) in objects" :key="oIdx" 
        :transform="'translate(' + o.x + ' ' + o.y + ')'"
        :filter="(selectIdx==oIdx)?'url(#myFilter)':null"
        @mousedown.exact="move($event, oIdx)" @mousedown.ctrl="flipCard($event, oIdx)">
        <transition v-for="(f, fIdx) in o.faces" :key="fIdx" name="slide-fade">
          <image v-if="o.faceIndex == fIdx" xlink:href="http://blog-imgs-42.fc2.com/p/i/p/piposozai/cardss.png"
            v-bind:style="{ transformOrigin: (f.w / 2) + 'px ' + (f.h / 2) + 'px' }"
            preserveAspectRatio="none"
            :clip-path="f.clipPath"
            :x="f.x" :y="f.y" :width="o.w" :height="o.h" />
        </transition>
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
          faces: [
            {
              w: cellW,
              h: cellH,
              x: -cellW * i,
              y: -cellH * j,
              clipPath: 'inset(' + [cellH * j, cellW * (cols - i - 1), cellH * (rows - j - 1), cellW * i].join(' ') + ')',
            },
            {
              w: cellW,
              h: cellH,
              x: -cellW * (cols - 1),
              y: -cellH * (rows - 1),
              clipPath: 'inset(' + [cellH * (rows - 1), 0, 0, cellW * (cols - 1)].join(' ') + ')',
            }
          ],
          w: w,
          h: h,
          x: 0,
          y: 0,
          faceIndex: 0,
          bReverse: false,
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
      var tempX = dx + Number(this.objects[this.selectIdx].x)
      var tempY = dy + Number(this.objects[this.selectIdx].y)
      if (tempX > 0) this.objects[this.selectIdx].x = tempX
      if (tempY > 0) this.objects[this.selectIdx].y = tempY
      e.preventDefault()
    },
    flipCard (e, i) {
      /*if (this.objects[i].bReverse) {
        this.objects[i].x = this.objects[i].x1
        this.objects[i].y = this.objects[i].y1
        this.objects[i].clipPath = this.objects[i].clipPath1
      } else {
        this.objects[i].x = this.objects[i].x2
        this.objects[i].y = this.objects[i].y2
        this.objects[i].clipPath = this.objects[i].clipPath2
      }*/
      this.objects[i].faceIndex = (this.objects[i].faceIndex + 1) % this.objects[i].faces.length
      this.objects[i].bReverse = !this.objects[i].bReverse
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