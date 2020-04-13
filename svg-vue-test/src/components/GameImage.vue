<template>
  <image
    preserveAspectRatio ="none"
    :xlink:href ="source"
    :style ="{
      transformOrigin: transformOrigin,
      pointerEvents: pointerEvents}"     
    :clip-path ="clipPath"
    :x ="x"
    :y ="y"
    :width="sourceWidth"
    :height="sourceHeight" />
</template>

<script>
export default {
  name: 'GameImage',
  props: {
    source: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    column: {
      type: Number,
      required: false,
      default: 0
    },
    row: {
      type: Number,
      required: false,
      default: 0
    },
    columnCount: {
      type: Number,
      required: false,
      default: 0
    },
    rowCount: {
      type: Number,
      required: false,
      default: 0
    },
    round: {
      type: Number,
      required: false,
      default: 8
    },
    enablePointerEvent: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    x: function() {
      return -this.width * this.column
    },
    y: function() {
      return -this.height * this.row
    },
    sourceWidth: function() {
      return this.width * this.columnCount
    },
    sourceHeight: function() {
      return this.height * this.rowCount
    },
    transformOrigin: function () {
      return this.width / 2 + 'px ' + this.height / 2 + 'px'
    },
    pointerEvents: function () {
      return this.enablePointerEvent ? 'auto' : 'none'
    },
    clipPath: function () {
      return 'inset(' + [
          this.height * this.row,
          this.width * (this.columnCount - this.column - 1),
          this.height * (this.rowCount - this.row - 1),
          this.width * this.column,
          'round', this.round
        ].join(' ') + ')'
    }
  }
}
</script>
