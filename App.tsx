import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
  withDecay,
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

  const cardWidth = windowWidth - (CARD_MARGIN + CARD_PREVIEW) * 2;

  const [activeIndex, setActiveIndex] = useState(0);

  const translation = {
    x: useSharedValue(CARD_PREVIEW),
  };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    AnimatedGHContext
  >({
    onStart: (event, ctx) => {
      ctx.startX = translation.x.value;
    },
    onActive: (event, ctx) => {
      translation.x.value = ctx.startX + event.translationX;
    },
    onEnd: (event) => {
      console.log(event);
      // translation.x.value = withDecay({
      //   velocity: event.velocityX,
      // });
      // translation.x.value = withSpring(0, {
      //   overshootClamping: false,
      //   damping: 10,
      // });
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
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[rnStyles.carousel, styles]}>
          {data.map((letter, index) => (
            <Animated.View
              key={letter}
              style={{
                width: cardWidth,
                height: 200,
                backgroundColor: index === activeIndex ? 'blue' : 'teal',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: CARD_MARGIN,
              }}
            >
              <Text>{letter}</Text>
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
    paddingLeft: CARD_MARGIN,
    backgroundColor: 'yellow',
  },
});
