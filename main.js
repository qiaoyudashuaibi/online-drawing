//初始化必要数据
let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext('2d'),
    eraserEnabled = false,
    pen = document.getElementById("pen"),
    eraser = document.getElementById("eraser"),
    color = document.getElementById("color"),
    thickness = document.getElementById("thickness"),
    actions = document.getElementById("actions")

//画布填充窗口
autoSetCanvasSize(canvas)

//执行用户动作
painting(canvas)

//监听用户点击事件
color.addEventListener('click', changeColor)
thickness.addEventListener('click', changeThickness)
actions.addEventListener('click', (e) => {
  if (e.target.tagName === 'svg') {
    takeAction(e.target.id)
  } else if (e.target.tagName === 'use') {
    takeAction(e.target.parentElement.id)
  } else if (e.target.tagName === 'LI') {
    takeAction(e.target.children[0].id)
  }
})

// 绘制
function painting(canvas) {
  ctx.strokeStyle = "black"
  ctx.fillStyle = "black"
  ctx.lineWidth = 2
  ctx.radius = 1
  //画笔使用状态
  let isUsing = false
  let previousPoint = {}
  //设备检测
  if (document.body.ontouchstart !== undefined) {
    //触屏设备
    canvas.addEventListener('touchstart', touchStart.bind(null, previousPoint))
    canvas.addEventListener('touchmove', touchMove.bind(null, previousPoint))
    canvas.addEventListener('touchcancel', touchCancel)
  } else {
    //PC设备
    canvas.onmousedown = (e) => {
      isUsing = true
      let x = e.clientX
      let y = e.clientY
      if (!eraserEnabled) {
        previousPoint = {x: x, y: y}
        drawPoint(x, y, ctx.radius)
      } else {
        ctx.clearRect(x - 5, y - 5, 10, 10)
      }
    }
    canvas.onmousemove = (e) => {
      if (isUsing) {
        let x = e.clientX
        let y = e.clientY
        let newPoint = {x: x, y: y}
        if (!eraserEnabled) {
          drawPoint(x, y, ctx.radius)
          drawLine(previousPoint.x, previousPoint.y, newPoint.x, newPoint.y)
          previousPoint = newPoint
        } else {
          ctx.clearRect(x - 5, y - 5, 10, 10)
        }
      }
    }
    canvas.onmouseup = () => {
      isUsing = false
    }
  }
}

//触摸开始
function touchStart(point, e) {
  e.preventDefault()
  let x, y
  for (let touch of e.changedTouches) {
    x = Math.floor(touch.clientX)
    y = Math.floor(touch.clientY)
    if (!eraserEnabled) {
      point[touch.identifier] = {x: x, y: y}
      drawPoint(x, y, ctx.radius)
    } else {
      ctx.clearRect(x - 5, y - 5, 10, 10)
    }
  }
}

//触摸移动
function touchMove(originalPoint, e) {
  e.preventDefault()
  let x, y, newPoint = {}
  for (let touch of e.changedTouches) {
    x = Math.floor(touch.clientX)
    y = Math.floor(touch.clientY)
    if (!eraserEnabled) {
      newPoint[touch.identifier] = {x: x, y: y}
      drawPoint(x, y, ctx.radius)           //需要添加此函数才不会使得画出来的线在lineWidth变大时不完整
      drawLine(originalPoint[touch.identifier].x, originalPoint[touch.identifier].y, newPoint[touch.identifier].x, newPoint[touch.identifier].y)
      originalPoint[touch.identifier] = newPoint[touch.identifier]
    } else {
      ctx.clearRect(x - 8, y - 8, 16, 16)
    }
  }
}

//触摸取消
function touchCancel() {
  alert("最多只能五指绘图！")
}

//选择颜色
function changeColor(e) {
  let selectedColor = e.target.id
  ctx.strokeStyle = selectedColor
  ctx.fillStyle = selectedColor
  whichActived(selectedColor, 'color')
}

//画笔粗细
function changeThickness(e) {
  let selectedThickness = e.target.id
  if (selectedThickness === 'thin') {
    ctx.lineWidth = 2
    ctx.radius = 1
  } else if (selectedThickness === 'middle') {
    ctx.lineWidth = 6
    ctx.radius = 3
  } else if (selectedThickness === 'thick') {
    ctx.lineWidth = 10
    ctx.radius = 5
  }
  whichActived(selectedThickness, 'thickness')
}

//画笔状态激活
function whichActived(target, parentID) {
  let parentNode
  if (parentID === 'color') {
    parentNode = color
  } else if (parentID === 'thickness') {
    parentNode = thickness
  }
  for (let i = 0; i < parentNode.children.length; i++) {
    if (target === parentNode.children[i].id) {
      parentNode.children[i].className = "active"
    } else if (target !== parentID) {
      parentNode.children[i].className = ""
    }
  }
}

// 圆点笔迹
function drawPoint(x, y, radius) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

// 线条笔迹
function drawLine(x1, y1, x2, y2) {
  // 解决IOS中获取不到ctx设置的问题
  if (ctx.lineWidth === 1) {
    ctx.lineWidth = 2
    ctx.radius = 1
  }
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

// 选择用户动作
function takeAction(element) {
  if (element === 'pen') {
    eraserEnabled = false
    pen.classList.add("active")
    eraser.classList.remove("active")
    color.className = "active"
    thickness.className = "active"
  } else if (element === 'eraser') {
    eraserEnabled = true
    pen.classList.remove("active")
    eraser.classList.add("active")
    color.className = "remove"
    thickness.className = "remove"
  } else if (element === 'clearall') {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    eraserEnabled = false
    pen.classList.add("active")
    eraser.classList.remove("active")
    color.className = "active"
    thickness.className = "active"
  } else if (element === 'save') {
    let a = document.createElement("a")
    a.href = canvas.toDataURL()
    a.target = "_blank"
    a.download = "image.png"
    a.click()
  }
}

//自动调整画布大小
function autoSetCanvasSize(canvas) {
  setCanvasSize(canvas)
  window.onresize = () => {
    setCanvasSize(canvas)
  }

  //设置画布宽高
  function setCanvasSize(canvas) {
    let pageWidth = document.documentElement.clientWidth
    let pageHeight = document.documentElement.clientHeight
    canvas.width = pageWidth
    canvas.height = pageHeight
  }
}
