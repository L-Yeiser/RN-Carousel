import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

const data = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
];

type AnimatedGHContext = {
  startX: number;
};

const CARD_MARGIN = 24;
const CARD_PREVIEW = 50;

function DragAndSnap(): React.ReactElement {
  const { width: windowWidth } = useWindowDimensions();

  const cardWidth = windowWidth - CARD_PREVIEW * 2;

  const [activeIndex, setActiveIndex] = useState(0);

  const carouselX = useSharedValue(CARD_PREVIEW);

  const currentIndex = useSharedValue(0);

  const translation = useMemo(
    () => ({
      x: carouselX,
    }),
    [carouselX],
  );

  const updateIndex = (val: number) => {
    // This would use callback
    setActiveIndex(val);
  };

  useDerivedValue(() => {
    runOnJS(updateIndex)(currentIndex.value);
  });

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    AnimatedGHContext
  >({
    onStart: (event, ctx) => {
      ctx.startX = translation.x.value;
      console.log(
        'ON START',
        translation.x.value,
        Math.round(translation.x.value / cardWidth) * cardWidth,
      );
    },
    onActive: (event, ctx) => {
      translation.x.value = ctx.startX + event.translationX;
    },
    onEnd: (event, ctx) => {
      const { translationX } = event;
      const direction = translationX / Math.abs(translationX);
      let finalX = ctx.startX;

      if (Math.abs(translationX) > cardWidth / 3) {
        finalX = ctx.startX + direction * cardWidth;
      }

      const index = Math.abs((finalX - CARD_PREVIEW) / cardWidth);

      console.log('FINAL X', finalX, index);

      translation.x.value = withSpring(finalX, {
        overshootClamping: true,
      });

      currentIndex.value = index;
    },
  });

  const styles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translation.x.value,
        },
      ],
    };
  });

  return (
    <View style={rnStyles.container}>
      <View
        style={{
          position: 'absolute',
          top: 100,
          left: CARD_PREVIEW,
          width: CARD_PREVIEW,
          height: 100,
          backgroundColor: 'purple',
        }}
      />
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[rnStyles.carousel, styles]}>
          {data.map((letter, index) => (
            <Animated.View
              key={letter}
              style={{
                width: cardWidth,
                height: 200,
                backgroundColor: 'orange',
                alignItems: 'center',
                justifyContent: 'center',
                paddingRight: CARD_MARGIN,
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: index === activeIndex ? 'blue' : 'teal',
                }}
              >
                <Text>{letter}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

export default DragAndSnap;

const rnStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carousel: {
    position: 'absolute',
    bottom: 200,
    flexDirection: 'row',
  },
});
