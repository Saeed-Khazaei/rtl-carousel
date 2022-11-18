import React, { Children, ComponentProps, useEffect, useMemo, useRef, useState } from 'react'
// @ ts-ignoe
import './styles.css'

const SPAN_WIDTH = 100
interface Props extends Pick<ComponentProps<'div'>, 'children'> {
  sliderCount: number
  direction?: 'ltr' | 'rtl'
}

const Carousel = ({ children, sliderCount = 1, direction = 'ltr' }: Props) => {
  const arrayChildren: React.ReactNode[] = useMemo(() => Children.toArray(children), [children])
  const cofficientDirection = useMemo(() => (direction != 'ltr' ? -1 : 1), [direction])
  const [sliderPosition, setSliderPosition] = useState(0)
  const [touchStartPosition, setTouchStartPosition] = useState(0)
  const [touchEndPosition, setTouchEndPosition] = useState(0)
  const [touched, setTouched] = useState(false)
  const [swiped, setSwiped] = useState(false)
  const [mouseStartPosition, setMouseStartPosition] = useState(0)
  const [mouseEndPosition, setMouseEndPosition] = useState(0)
  const [mouseClicked, setMouseClicked] = useState(false)
  const [mouseSwiped, setMouseSwiped] = useState(false)
  const frameWidth = useRef<HTMLDivElement>(null)

  const prevSlideHandler = () => {
    let newPosition = sliderPosition
    if (newPosition > 0) {
      newPosition = newPosition - 1
    }
    translateFullSlides(newPosition)
    setSliderPosition(newPosition)
  }

  const nextSlideHandler = () => {
    let newPosition = sliderPosition
    if (newPosition < arrayChildren.length - 1) {
      newPosition = newPosition + 1
    }
    translateFullSlides(newPosition)
    setSliderPosition(newPosition)
  }

  const jumpToSlideHandler = (id: number) => {
    translateFullSlides(id)
    setSliderPosition(id)
  }

  const keyPressHandler = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      if (cofficientDirection > 0) {
        prevSlideHandler()
      } else {
        nextSlideHandler()
      }
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      event.stopPropagation()
      if (cofficientDirection > 0) {
        nextSlideHandler()
      } else {
        prevSlideHandler()
      }
      return
    }
  }

  const speedUpAnimation = () => {
    for (let i = Math.max(0, sliderPosition - 2); i < (Math.min(arrayChildren.length, sliderPosition + 3) || 1); i++) {
      const elem = document.getElementById(`carouselitem` + i) as HTMLElement
      elem.classList.add('fastAnimation')
    }
  }

  const slowDownAnimation = () => {
    for (let i = Math.max(0, sliderPosition - 2); i < (Math.min(arrayChildren.length, sliderPosition + 3) || 1); i++) {
      const elem = document.getElementById(`carouselitem` + i) as HTMLElement
      elem.classList.remove('fastAnimation')
    }
  }

  const touchStartHandler = (e: React.TouchEvent<HTMLElement>) => {
    speedUpAnimation()
    setTouchStartPosition(e.targetTouches[0].clientX)
    setTouchEndPosition(e.targetTouches[0].clientX)
    setTouched(true)
  }

  const touchMoveHandler = (e: React.TouchEvent<HTMLElement>) => {
    setTouchEndPosition(e.targetTouches[0].clientX)
    if (frameWidth && frameWidth.current) {
      const fw = frameWidth.current.offsetWidth
      const translateDist = ((touchEndPosition - touchStartPosition) / fw) * 100
      translatePartialSlides(translateDist)
      if (touched === true) {
        setSwiped(true)
      }
    }
  }

  const touchEndHandler = () => {
    if (swiped) {
      slowDownAnimation()
      const diff = touchStartPosition - touchEndPosition
      if (cofficientDirection * diff > 75) {
        nextSlideHandler()
      } else if (cofficientDirection * diff < -75) {
        prevSlideHandler()
      } else {
        jumpToSlideHandler(sliderPosition)
      }
    }
    setTouched(false)
    setSwiped(false)
  }

  const mouseStartHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    speedUpAnimation()
    setMouseStartPosition(e.clientX)
    setMouseEndPosition(e.clientX)
    setMouseClicked(true)
  }

  const mouseMoveHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (frameWidth && frameWidth.current) {
      const fw = frameWidth.current.offsetWidth
      if (mouseClicked === true) {
        setMouseEndPosition(e.clientX)
        const translateDist = ((mouseEndPosition - mouseStartPosition) / fw) * 100
        translatePartialSlides(translateDist)
        setMouseSwiped(true)
      }
    }
  }

  const mouseEndHandler = () => {
    slowDownAnimation()
    if (mouseSwiped === true) {
      const diff = mouseStartPosition - mouseEndPosition
      if (cofficientDirection * diff > 100) {
        nextSlideHandler()
      } else if (cofficientDirection * diff < -100) {
        prevSlideHandler()
      } else {
        jumpToSlideHandler(sliderPosition)
      }
    }
    setMouseClicked(false)
    setMouseSwiped(false)
  }

  const translatePartialSlides = (toTranslate: number) => {
    const currentTranslation = -cofficientDirection * sliderPosition * SPAN_WIDTH
    const totalTranslation = currentTranslation + toTranslate
    const shiftPosition = sliderCount - arrayChildren.length + sliderPosition
    for (const i in arrayChildren) {
      const elem = document.getElementById(`carouselitem` + i) as HTMLElement
      let tt = totalTranslation
      if (shiftPosition >= 0) {
        tt = tt - -cofficientDirection * (shiftPosition * 100)
      }
      elem.style.transform = `translateX(calc(${tt}%))`
    }
  }

  const translateFullSlides = (newPosition: number) => {
    const toTranslate = -cofficientDirection * SPAN_WIDTH * newPosition
    const shiftPosition = sliderCount - arrayChildren.length + newPosition
    for (let index = 0; index < arrayChildren.length; index++) {
      const elem = document.getElementById(`carouselitem` + index) as HTMLElement
      let tt = toTranslate
      if (shiftPosition >= 0) {
        tt = tt - -cofficientDirection * (shiftPosition * 100)
      }
      elem.style.transform = `translateX(${tt}%)`
    }
  }

  const displayItems = arrayChildren.map((child: any, index: number) => (
    <div
      className={'carouselItem'}
      id={`carouselitem` + index}
      style={{ width: `calc(100% / ${sliderCount})` }}
      key={child}
    >
      {child}
    </div>
  ))

  const positionIndicators = arrayChildren.map((_, index: number) => (
    <div
      key={index}
      className={sliderPosition === index ? 'positionIndicator'.concat(' currentPosition') : 'positionIndicator'}
      onClick={() => jumpToSlideHandler(index)}
    ></div>
  ))

  useEffect(() => {
    window.addEventListener('keydown', keyPressHandler)
    return () => {
      window.removeEventListener('keydown', keyPressHandler)
    }
  })

  return (
    <>
      <div className={'container'}>
        <div
          className={'displayFrame'}
          onTouchStart={touchStartHandler}
          onTouchMove={touchMoveHandler}
          onTouchEnd={touchEndHandler}
          onMouseDown={mouseStartHandler}
          onMouseMove={mouseMoveHandler}
          onMouseUp={mouseEndHandler}
          onMouseLeave={mouseEndHandler}
          style={{ direction }}
          ref={frameWidth}
        >
          {displayItems}
        </div>
      </div>

      <div className={'navigation'} style={{ direction }}>
        {positionIndicators}
      </div>
    </>
  )
}

export default Carousel
