import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
  withDecay,
  useDerivedValue,
  runOnJS,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';

import campgroundSearchResults from '../campgroundSearchResults';
import CarouselCard from './CarouselCard';

type AnimatedGHContext = {
  startX: number;
};

const CARD_MARGIN = 24;
const CARD_PREVIEW = 50;

const CARDS = Array(5).fill(true);

const Carousel = () => {
  const { width: windowWidth } = useWindowDimensions();

  const cardWidth = windowWidth - CARD_PREVIEW * 2;

  const [state, setState] = useState({
    activeIndex: 2,
    offset: 0,
    overlayActiveIndex: 2,
    overlayOffset: 0,
    // shouldShowOverlay: false,
  });

  const currentIndex = useSharedValue(2);

  const overlayOpacity = useSharedValue(0);

  const nextOverlayOpacity = useSharedValue(0);

  const translation = {
    x: useSharedValue(-(cardWidth * 2 - CARD_PREVIEW)),
    overlayX: useSharedValue(-(cardWidth * 2 - CARD_PREVIEW)),
    state: useSharedValue('inactive' as 'inactive' | 'active'),
  };

  const updateIndex = (val: number) => {
    if (val !== state.activeIndex) {
      const offsetDirection = val > state.activeIndex ? -1 : 1;
      setState({
        ...state,
        activeIndex: val,
        offset: (val - 2) * cardWidth,
        overlayOffset: offsetDirection * cardWidth,
      });
    }
  };

  const setTranslationState = (val: 'inactive' | 'active') => {
    console.log('SET TRANSLATION STATE', val);
    if (val === 'active' && nextOverlayOpacity.value !== 1) {
      setState({
        ...state,
        // shouldShowOverlay: true,
        overlayOffset: 0,
        overlayActiveIndex: state.activeIndex,
      });
      nextOverlayOpacity.value = 1;
      overlayOpacity.value = withDelay(50, withTiming(1));
    } else if (val === 'inactive' && nextOverlayOpacity.value !== 0) {
      nextOverlayOpacity.value = 0;
      overlayOpacity.value = withDelay(50, withTiming(0));
    }
  };

  useDerivedValue(() => {
    runOnJS(updateIndex)(currentIndex.value);
  });

  // this calls the fnx each render so if you update the state within cb you must protect
  useDerivedValue(() => {
    runOnJS(setTranslationState)(translation.state.value);
  });

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    AnimatedGHContext
  >({
    onStart: (event, ctx) => {
      console.log('START');
      ctx.startX = translation.x.value;
      translation.state.value = 'active';
    },
    onActive: (event, ctx) => {
      translation.x.value = ctx.startX + event.translationX;
    },
    onEnd: (event, ctx) => {
      const { translationX } = event;
      const direction = translationX / Math.abs(translationX);
      let finalX = ctx.startX;
      let index = currentIndex.value;

      if (Math.abs(translationX) > cardWidth / 3) {
        finalX = ctx.startX + direction * cardWidth;
        index = index - direction;
      }

      translation.x.value = finalX;

      currentIndex.value = index;
    },
    onFinish: () => {
      console.log('FINISH');
      translation.state.value = 'inactive';
    },
  });

  const carouselStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translation.x.value + state.offset,
        },
      ],
    };
  });

  const overlayStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            translation.x.value +
            // cardWidth +
            state.offset +
            state.overlayOffset,
        },
      ],
      opacity: overlayOpacity.value,
    };
  });

  return (
    <View style={rnStyles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View pointerEvents="box-none" style={{ flex: 1 }}>
          <Animated.View style={[rnStyles.carousel, carouselStyles]}>
            {CARDS.map((card, index) => {
              const offset = 4 - index;
              const campground =
                campgroundSearchResults[state.activeIndex - offset];
              return (
                <Animated.View
                  style={[rnStyles.card, { width: cardWidth }]}
                  key={index}
                >
                  <>
                    <CarouselCard campground={campground} />
                  </>
                </Animated.View>
              );
            })}
          </Animated.View>

          <Animated.View style={[rnStyles.carousel, overlayStyles]}>
            {CARDS.map((card, index) => {
              const offset = 4 - index;
              const campground =
                campgroundSearchResults[state.overlayActiveIndex - offset];
              return (
                <Animated.View
                  style={[rnStyles.card, { width: cardWidth }]}
                  key={index}
                >
                  <CarouselCard campground={campground} />
                </Animated.View>
              );
            })}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default Carousel;

const rnStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
  },
  carousel: {
    position: 'absolute',
    bottom: 200,
    flexDirection: 'row',
  },
  card: {
    height: 200,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: CARD_MARGIN,
    borderWidth: 1,
    borderColor: 'black',
  },
});
