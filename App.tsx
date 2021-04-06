import React, { useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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

import campgroundSearchResults from './campgroundSearchResults';

type AnimatedGHContext = {
  startX: number;
};

const CARD_MARGIN = 24;
const CARD_PREVIEW = 50;

const Card = ({
  offset,
  currentIndex,
}: {
  offset: number;
  currentIndex: number;
}) => {
  const campground = campgroundSearchResults[currentIndex - offset];

  return campground ? (
    <View style={[rnStyles.cardWrapper]}>
      {/* <Text>N {-2 + offset}</Text> */}
      <View style={{ width: '100%', height: 30 }}>
        <Text>VALUE: {campground.attributes.name}</Text>
      </View>

      <View style={{ width: 100, height: 100 }}>
        {!!campground.attributes['photo-url'] && (
          <Image
            source={{
              uri: campground.attributes['photo-url'],
            }}
            style={{ width: 100, height: 100 }}
            width={100}
            height={100}
          />
        )}
      </View>
    </View>
  ) : null;
};

function DragAndSnap(): React.ReactElement {
  const { width: windowWidth } = useWindowDimensions();

  const cardWidth = windowWidth - CARD_PREVIEW * 2;

  const [state, setState] = useState({
    activeIndex: 2,
    offset: 0,
  });

  const currentIndex = useSharedValue(2);

  const carouselX = useSharedValue(-(cardWidth * 2 - CARD_PREVIEW));

  const translation = useMemo(
    () => ({
      x: carouselX,
    }),
    [carouselX],
  );

  const updateIndex = (val: number) => {
    if (val !== state.activeIndex) {
      console.log('on index changed', val);
      setState({
        activeIndex: val,
        offset: (val - 2) * cardWidth,
      });
    }
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
      let index = currentIndex.value;

      if (Math.abs(translationX) > cardWidth / 3) {
        finalX = ctx.startX + direction * cardWidth;
        index = index - direction;
      }

      // const index = Math.abs((finalX - CARD_PREVIEW) / cardWidth);

      translation.x.value = withSpring(finalX, {
        overshootClamping: true,
      });

      currentIndex.value = index;

      // translation.x.value = ctx.startX;
    },
  });

  const styles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translation.x.value + state.offset,
        },
      ],
    };
  });

  console.log('WTF', translation.x.value, state.offset);

  return (
    <View style={rnStyles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[rnStyles.carousel, styles]}>
          <Animated.View
            style={[
              rnStyles.card,
              {
                width: cardWidth,
              },
            ]}
          >
            <Card currentIndex={state.activeIndex} offset={4} />
          </Animated.View>
          <Animated.View
            style={[
              rnStyles.card,
              {
                width: cardWidth,
              },
            ]}
          >
            <Card currentIndex={state.activeIndex} offset={3} />
          </Animated.View>
          <Animated.View
            style={[
              rnStyles.card,
              {
                width: cardWidth,
              },
            ]}
          >
            <Card currentIndex={state.activeIndex} offset={2} />
          </Animated.View>
          <Animated.View
            style={[
              rnStyles.card,
              {
                width: cardWidth,
              },
            ]}
          >
            <Card currentIndex={state.activeIndex} offset={1} />
          </Animated.View>
          <Animated.View
            style={[
              rnStyles.card,
              {
                width: cardWidth,
              },
            ]}
          >
            <Card currentIndex={state.activeIndex} offset={0} />
          </Animated.View>
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
  card: {
    height: 200,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: CARD_MARGIN,
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'teal',
  },
});
