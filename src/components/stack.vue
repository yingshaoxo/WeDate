<script setup lang="ts">
import functions from '/@/store/functions'

/**
 * Detecting prefixes for saving time and bytes
 */
function detectPrefixes() {
  let transform
  let transition
  let transitionEnd
  let hasTranslate3d
  (function () {
    let el = document.createElement('_')
    let style = el.style
    let prop
    if (style[prop = 'webkitTransition'] === '') {
      transitionEnd = 'webkitTransitionEnd'
      transition = prop
    }
    if (style[prop = 'transition'] === '') {
      transitionEnd = 'transitionend'
      transition = prop
    }
    if (style[prop = 'webkitTransform'] === '') {
      transform = prop
    }
    if (style[prop = 'msTransform'] === '') {
      transform = prop
    }
    if (style[prop = 'transform'] === '') {
      transform = prop
    }
    document.body.insertBefore(el, null)
    style[transform] = 'translate3d(0, 0, 0)'
    hasTranslate3d = !!global.getComputedStyle(el).getPropertyValue(transform)
    document.body.removeChild(el)
  }())
  return {
    transform,
    transition,
    transitionEnd,
    hasTranslate3d
  }
}

import { computed, defineProps, onMounted, reactive, ref, unref, withDefaults, nextTick } from 'vue'
import logo from '/@/assets/logo.png'

export interface Props {
  stackinit: any
  pages: any[] | null
}


const props = withDefaults(defineProps<Props>(), {
  stackinit: {} as any,
  pages: null
})


const rootElement = ref(null as any);


const emits = defineEmits(['handleImageDoubleClick'])


// @click="() => { functions.basic.print('click: ' + index) }"
const dict = reactive({
  tempData: {
    lastTouch: new Date().getTime(),
  },
  basicdata: {
    start: {} as { x: number, y: number, t: number },
    end: {} as { x: number, y: number, t: number },
  },
  temporaryData: {
    prefixes: detectPrefixes(),
    offsetY: 0, //''
    poswidth: 0,
    posheight: 0,
    lastPosWidth: 0,//'',
    lastPosHeight: 0,//'',
    lastZindex: 0, //'',
    rotate: 0,
    lastRotate: 0,
    visible: props.stackinit?.visible || 3,
    tracking: false,
    animation: false,
    currentPage: props.stackinit?.currentPage || 0,
    opacity: 1,
    lastOpacity: 0,
    swipe: false,
    zIndex: 10
  },
  // 划出面积比例
  offsetRatio: computed(() => {
    const theElement = unref(rootElement);

    let width = theElement?.offsetWidth
    let height = theElement?.offsetHeight

    let offsetWidth = width - Math.abs(dict.temporaryData.poswidth) as any
    let offsetHeight = height - Math.abs(dict.temporaryData.posheight) as any

    let ratio = 1 - (offsetWidth * offsetHeight) / (width * height) || 0
    return ratio > 1 ? 1 : ratio
  }),
  // 划出宽度比例
  offsetWidthRatio: computed(() => {
    const theElement = unref(rootElement);

    let width = theElement?.offsetWidth
    let offsetWidth = width - Math.abs(dict.temporaryData.poswidth) as any
    let ratio = 1 - offsetWidth / width || 0

    return ratio
  }),
  functions: {
    getImageHtmlCodeByItem: (item: any): string => {
      const url = item?.picture?.url()
      if (url) {
        const htmlCode = `<img src='${url}'>`
        return htmlCode
      }
      return '<div>No picture</div>'
    },
    runOnTouchStartToCheckIfItsAdoubleClick: (item: any) => {
      const now = new Date().getTime()
      const lastTouch = unref(dict.tempData.lastTouch)
      const doubleClickInterval = 300
      if (now - lastTouch < doubleClickInterval) {
        dict.tempData.lastTouch = now

        emits('handleImageDoubleClick', item)
        // setTimeout(async () => {
        //   functions.basic.print("Should get redirected to the chat page")
        // }, 0)

        return true
      } else {
        dict.tempData.lastTouch = now
        return false
      }
    },
    touchstart: (e: any, item: any) => {
      dict.functions.runOnTouchStartToCheckIfItsAdoubleClick(item)

      if (dict.temporaryData.tracking) {
        return
      }
      // 是否为touch
      if (e.type === 'touchstart') {
        if (e.touches.length > 1) {
          dict.temporaryData.tracking = false
          return
        } else {
          // 记录起始位置
          dict.basicdata.start.t = new Date().getTime()
          dict.basicdata.start.x = e.targetTouches[0].clientX
          dict.basicdata.start.y = e.targetTouches[0].clientY
          dict.basicdata.end.x = e.targetTouches[0].clientX
          dict.basicdata.end.y = e.targetTouches[0].clientY
          // offsetY在touch事件中没有，只能自己计算
          dict.temporaryData.offsetY = e.targetTouches[0].pageY - unref(rootElement).offsetParent.offsetTop
        }
        // pc操作
      } else {
        dict.basicdata.start.t = new Date().getTime()
        dict.basicdata.start.x = e.clientX
        dict.basicdata.start.y = e.clientY
        dict.basicdata.end.x = e.clientX
        dict.basicdata.end.y = e.clientY
        dict.temporaryData.offsetY = e.offsetY
      }
      dict.temporaryData.tracking = true
      dict.temporaryData.animation = false
    },
    touchmove: (e: any) => {
      // 记录滑动位置
      if (dict.temporaryData.tracking && !dict.temporaryData.animation) {
        if (e.type === 'touchmove') {
          e.preventDefault()
          dict.basicdata.end.x = e.targetTouches[0].clientX
          dict.basicdata.end.y = e.targetTouches[0].clientY
        } else {
          e.preventDefault()
          dict.basicdata.end.x = e.clientX
          dict.basicdata.end.y = e.clientY
        }
        // 计算滑动值
        dict.temporaryData.poswidth = dict.basicdata.end.x - dict.basicdata.start.x
        dict.temporaryData.posheight = dict.basicdata.end.y - dict.basicdata.start.y
        let rotateDirection = dict.functions.rotateDirection()
        let angleRatio = dict.functions.angleRatio()
        dict.temporaryData.rotate = rotateDirection * dict.offsetWidthRatio * 15 * angleRatio
      }
    },
    touchend: (e: any) => {
      dict.temporaryData.tracking = false
      dict.temporaryData.animation = true
      // 滑动结束，触发判断
      // 判断划出面积是否大于0.4
      if (dict.offsetRatio >= 0.4) {
        // 计算划出后最终位置
        let ratio = Math.abs(dict.temporaryData.posheight / dict.temporaryData.poswidth)
        dict.temporaryData.poswidth = dict.temporaryData.poswidth >= 0 ? dict.temporaryData.poswidth + 200 : dict.temporaryData.poswidth - 200
        dict.temporaryData.posheight = dict.temporaryData.posheight >= 0 ? Math.abs(dict.temporaryData.poswidth * ratio) : -Math.abs(dict.temporaryData.poswidth * ratio)
        dict.temporaryData.opacity = 0
        dict.temporaryData.swipe = true
        dict.functions.nextTick()
        // 不满足条件则滑入
      } else {
        dict.temporaryData.poswidth = 0
        dict.temporaryData.posheight = 0
        dict.temporaryData.swipe = false
        dict.temporaryData.rotate = 0
      }
    },
    nextTick: () => {
      // 记录最终滑动距离
      dict.temporaryData.lastPosWidth = dict.temporaryData.poswidth
      dict.temporaryData.lastPosHeight = dict.temporaryData.posheight
      dict.temporaryData.lastRotate = dict.temporaryData.rotate
      dict.temporaryData.lastZindex = 20
      // 循环currentPage
      dict.temporaryData.currentPage = dict.temporaryData.currentPage === props.pages?.length ?? 0 - 1 ? 0 : dict.temporaryData.currentPage + 1
      // currentPage切换，整体dom进行变化，把第一层滑动置最低

      nextTick(() => {
        dict.temporaryData.poswidth = 0
        dict.temporaryData.posheight = 0
        dict.temporaryData.opacity = 1
        dict.temporaryData.rotate = 0
      })
    },
    onTransitionEnd: (index: number) => {
      let lastPage = dict.temporaryData.currentPage === 0 ? props.pages?.length ?? 0 - 1 : dict.temporaryData.currentPage - 1
      // dom发生变化正在执行的动画滑动序列已经变为上一层
      if (dict.temporaryData.swipe && index === lastPage) {
        dict.temporaryData.animation = true
        dict.temporaryData.lastPosWidth = 0
        dict.temporaryData.lastPosHeight = 0
        dict.temporaryData.lastOpacity = 0
        dict.temporaryData.lastRotate = 0
        dict.temporaryData.swipe = false
        dict.temporaryData.lastZindex = -1
      }
    },
    prev: () => {
      dict.temporaryData.tracking = false
      dict.temporaryData.animation = true
      // 计算划出后最终位置
      let width = unref(rootElement)?.offsetWidth
      dict.temporaryData.poswidth = -width
      dict.temporaryData.posheight = 0
      dict.temporaryData.opacity = 0
      dict.temporaryData.rotate = -3
      dict.temporaryData.swipe = true
      dict.functions.nextTick()
    },
    next: () => {
      dict.temporaryData.tracking = false
      dict.temporaryData.animation = true
      // 计算划出后最终位置
      let width = unref(rootElement)?.offsetWidth
      dict.temporaryData.poswidth = width
      dict.temporaryData.posheight = 0
      dict.temporaryData.opacity = 0
      dict.temporaryData.rotate = 3
      dict.temporaryData.swipe = true
      dict.functions.nextTick()
    },
    rotateDirection: () => {
      if (dict.temporaryData.poswidth <= 0) {
        return -1
      } else {
        return 1
      }
    },
    angleRatio: () => {
      let height = unref(rootElement).offsetHeight
      let offsetY = dict.temporaryData.offsetY
      let ratio = -1 * (2 * offsetY / height - 1)
      return ratio || 0
    },
    inStack: (index: any, currentPage: number) => {
      let stack = []
      let visible = dict.temporaryData.visible
      let length = props.pages?.length ?? 0
      for (let i = 0; i < visible; i++) {
        if (currentPage + i < length) {
          stack.push(currentPage + i)
        } else {
          stack.push(currentPage + i - length)
        }
      }
      return stack.indexOf(index) >= 0
    },
    // 非首页样式切换
    transform: (index: number) => {
      let currentPage = dict.temporaryData.currentPage
      let length = props.pages?.length ?? 0
      let lastPage = currentPage === 0 ? props.pages?.length ?? 0 - 1 : currentPage - 1
      let style = {} as any
      let visible = dict.temporaryData.visible
      if (index === dict.temporaryData.currentPage) {
        return
      }
      if (dict.functions.inStack(index, currentPage)) {
        let perIndex = index - currentPage > 0 ? index - currentPage : index - currentPage + length
        style['opacity'] = '1'
        style['transform'] = 'translate3D(0,0,' + -1 * 60 * (perIndex - dict.offsetRatio) + 'px' + ')'
        style['zIndex'] = visible - perIndex
        if (!dict.temporaryData.tracking) {
          style[dict.temporaryData.prefixes.transition + 'TimingFunction'] = 'ease'
          style[dict.temporaryData.prefixes.transition + 'Duration'] = 300 + 'ms'
        }
      } else if (index === lastPage) {
        style['transform'] = 'translate3D(' + dict.temporaryData.lastPosWidth + 'px' + ',' + dict.temporaryData.lastPosHeight + 'px' + ',0px) ' + 'rotate(' + dict.temporaryData.lastRotate + 'deg)'
        style['opacity'] = dict.temporaryData.lastOpacity
        style['zIndex'] = dict.temporaryData.lastZindex
        style[dict.temporaryData.prefixes.transition + 'TimingFunction'] = 'ease'
        style[dict.temporaryData.prefixes.transition + 'Duration'] = 300 + 'ms'
      } else {
        style['zIndex'] = '-1'
        style['transform'] = 'translate3D(0,0,' + -1 * visible * 60 + 'px' + ')'
      }
      return style
    },
    // 首页样式切换
    transformIndex: (index: any) => {
      if (index === dict.temporaryData.currentPage) {
        let style = {} as any
        style['transform'] = 'translate3D(' + dict.temporaryData.poswidth + 'px' + ',' + dict.temporaryData.posheight + 'px' + ',0px) ' + 'rotate(' + dict.temporaryData.rotate + 'deg)'
        style['opacity'] = dict.temporaryData.opacity
        style['zIndex'] = 10
        if (dict.temporaryData.animation) {
          style[dict.temporaryData.prefixes.transition + 'TimingFunction'] = 'ease'
          style[dict.temporaryData.prefixes.transition + 'Duration'] = (dict.temporaryData.animation ? 300 : 0) + 'ms'
        }
        return style
      }
    }
  }
})


const next = () => {
  dict.functions.next()
}

const prev = () => {
  dict.functions.prev()
}

defineExpose({
  next,
  prev
})

onMounted(async () => {
  document.addEventListener('touchmove', (e) => {
    e.preventDefault()
  })
})
</script>

<template>
  <ul class="stack" ref="rootElement">
    <li
      class="stack-item"
      v-for="(item, index) in pages"
      :style="[dict.functions.transformIndex(index), dict.functions.transform(index)]"
      @touchmove.stop.capture.prevent="dict.functions.touchmove"
      @touchstart.stop.capture.prevent="(e: any) => { dict.functions.touchstart(e, item) }"
      @touchend.stop.capture.prevent="dict.functions.touchend"
      @touchcancel.stop.capture.prevent="dict.functions.touchend"
      @mousedown.stop.capture.prevent="(e: any) => { dict.functions.touchstart(e, item) }"
      @mouseup.stop.capture.prevent="dict.functions.touchend"
      @mousemove.stop.capture.prevent="dict.functions.touchmove"
      @mouseout.stop.capture.prevent="dict.functions.touchend"
      @webkit-transition-end="dict.functions.onTransitionEnd(index)"
      @transitionend="dict.functions.onTransitionEnd(index)"
    >
      <div v-html="dict.functions.getImageHtmlCodeByItem(item)"></div>
    </li>
  </ul>
</template>

<style lang="scss">
.stack {
  width: 100%;
  height: 100%;
  position: relative;
  perspective: 1000px;
  perspective-origin: 50% 150%;
  -webkit-perspective: 1000px;
  -webkit-perspective-origin: 50% 150%;
  margin: 0;
  padding: 0;
}
.stack-item {
  background: #fff;
  height: 100%;
  width: 100%;
  border-radius: 4px;
  text-align: center;
  overflow: hidden;
  position: absolute;
  opacity: 0;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: auto;

  align-items: center;
  justify-content: center;
}
.stack-item img {
  width: 100%;
  display: block;
  pointer-events: none;
}
.stack-container li.move-back {
  /* http://matthewlein.com/ceaser/ */
  -webkit-transition-timing-function: cubic-bezier(
    0.175,
    0.885,
    0.47,
    1
  ); /* older webkit */
  -webkit-transition-timing-function: cubic-bezier(0.175, 0.885, 0.47, 1.515);
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.47, 1.515);
}
</style>