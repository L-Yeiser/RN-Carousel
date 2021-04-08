import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import campgroundSearchResults from '../campgroundSearchResults';
import Animated, {
  Node,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import { State } from 'react-native-gesture-handler';
const CARD_MARGIN = 24;

const CardContent = ({ campground }) => {
  return (
    <View style={styles.content}>
      <Text>VALUE: {campground.attributes.name}</Text>

      {!!campground.attributes['photo-url'] && (
        <Image
          source={{
            uri: campground.attributes['photo-url'],
          }}
          style={styles.image}
          width={200}
          height={100}
        />
      )}
    </View>
  );
};

const CarouselCard = ({
  campground,
  isOverlay,
  index,
}: {
  campground?: any;
  isOverlay?: boolean;
  index: number;
}) => {
  return campground ? (
    <View
      style={[
        styles.container,
        { backgroundColor: isOverlay ? 'blue' : 'teal' },
      ]}
    >
      <Text>Index: {index}</Text>
      <CardContent campground={campground} />
    </View>
  ) : (
    <View
      style={[
        styles.container,
        { backgroundColor: isOverlay ? 'blue' : 'teal' },
      ]}
    ></View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'teal',
  },
  dragOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 200,
    height: 100,
  },
});

export default CarouselCard;
