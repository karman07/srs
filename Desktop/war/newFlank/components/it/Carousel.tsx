import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");

const images = [
  require("@/assets/images/pic/banner1.jpg"),
  require("@/assets/images/pic/banner2.jpg"),
];

export default function CustomCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (activeIndex + 1) % images.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000); // Auto-scroll every 3 sec

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <Image key={index} source={image} style={styles.image} />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 10,
  },
  image: {
    width: width * 0.9,
    height: 180,
    borderRadius: 10,
    marginHorizontal: width * 0.02,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#333",
    width: 10,
    height: 10,
  },
});
