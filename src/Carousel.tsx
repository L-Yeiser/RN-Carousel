import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useDerivedValue,
  runOnJS,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
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
const CARD_PREVIEW = 70;

const CARDS = Array(5).fill(true);

const Carousel = () => {
  const { width: windowWidth } = useWindowDimensions();

  const cardWidth = windowWidth - CARD_PREVIEW * 2;

  const [state, setState] = useState({
    activeIndex: 2,
    offset: 0,
    overlayActiveIndex: 2,
    overlayOffset: -cardWidth,
  });

  const translation = {
    nextX: useSharedValue(-cardWidth + CARD_PREVIEW),
    x: useSharedValue(-cardWidth + CARD_PREVIEW),
    state: useSharedValue('inactive' as 'inactive' | 'active'),
    currentIndex: useSharedValue(2),
    overlayOpacity: useSharedValue(0),
    nextOverlayOpacity: useSharedValue(0),
  };

  const updateIndex = (index: number) => {
    if (index !== state.activeIndex) {
      const offsetDirection = index > state.activeIndex ? -1 : 1;
      let offset = 0;

      if (index > 2) {
        offset = (index - 2) * cardWidth;
      }
      setState({
        ...state,
        activeIndex: index,
        offset: offset,
        overlayOffset: offsetDirection * cardWidth + -cardWidth,
      });
    }
  };

  const setTranslationState = (val: 'inactive' | 'active') => {
    if (val === 'active' && translation.nextOverlayOpacity.value !== 1) {
      cancelAnimation(translation.overlayOpacity);
      setState({
        ...state,
        overlayOffset: -cardWidth,
        overlayActiveIndex: state.activeIndex,
      });
      translation.nextOverlayOpacity.value = 1;
      translation.overlayOpacity.value = 1;
    } else if (
      val === 'inactive' &&
      translation.nextOverlayOpacity.value !== 0
    ) {
      cancelAnimation(translation.overlayOpacity);
      translation.nextOverlayOpacity.value = 0;
      translation.overlayOpacity.value = withDelay(250, withTiming(0));
    }
  };

  useDerivedValue(() => {
    runOnJS(updateIndex)(translation.currentIndex.value);
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
      // If there is an inprogress animation. Cancel it.
      cancelAnimation(translation.x);

      // Set translation x to the synchronous translation.nextX
      translation.x.value = translation.nextX.value;

      ctx.startX = translation.x.value;
      translation.state.value = 'active';
    },
    onActive: (event, ctx) => {
      translation.x.value = ctx.startX + event.translationX;
      translation.state.value = 'active';
    },
    onEnd: (event, ctx) => {
      const { translationX } = event;
      const direction = translationX / Math.abs(translationX);
      let finalX = ctx.startX;
      let index = translation.currentIndex.value;

      if (Math.abs(translationX) > cardWidth / 3) {
        finalX = ctx.startX + direction * cardWidth;
        index = index - direction;
      }
      translation.nextX.value = finalX;
      translation.x.value = withTiming(
        finalX,
        { duration: 100, easing: Easing.bezier(0, 0, 0.58, 1) },
        () => {
          translation.currentIndex.value = index;
        },
      );
    },
    onFinish: () => {
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
          translateX: translation.x.value + state.offset + state.overlayOffset,
        },
      ],
      opacity: translation.overlayOpacity.value,
    };
  });

  return (
    <View style={rnStyles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View pointerEvents="box-none" style={{ flex: 1 }}>
          <Animated.View style={[rnStyles.carousel, carouselStyles]}>
            {[undefined, ...campgroundSearchResults, undefined].map(
              (result, index) => {
                if (Math.abs(state.activeIndex - index) < 3) {
                  return (
                    <Animated.View
                      style={[
                        rnStyles.card,
                        {
                          width: cardWidth,
                        },
                      ]}
                      key={result?.id || index}
                    >
                      <CarouselCard campground={result} index={index} />
                    </Animated.View>
                  );
                }
                return null;
              },
            )}
          </Animated.View>

          <Animated.View style={[rnStyles.carousel, overlayStyles]}>
            {CARDS.map((card, index) => {
              const offset = 4 - index;
              const campground =
                campgroundSearchResults[state.overlayActiveIndex - offset];
              return (
                <Animated.View
                  style={[rnStyles.card, { width: cardWidth }]}
                  key={campground?.id || index}
                >
                  <CarouselCard
                    campground={campground}
                    // isOverlay
                    index={index}
                  />
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
