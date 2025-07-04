import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { ScoreAnimation as ScoreAnimationType } from '@/interfaces/scoring';

interface ScoreAnimationProps {
	animation: ScoreAnimationType;
	onComplete: (id: string) => void;
}

export const ScoreAnimation: React.FC<ScoreAnimationProps> = ({
	animation,
	onComplete,
}) => {
	const translateY = useRef(new Animated.Value(0)).current;
	const opacity = useRef(new Animated.Value(1)).current;
	const scale = useRef(new Animated.Value(0.8)).current;

	useEffect(() => {
		// Start animation sequence
		Animated.parallel([
			Animated.sequence([
				Animated.timing(scale, {
					toValue: 1.2,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.timing(scale, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
			]),
			Animated.timing(translateY, {
				toValue: -60,
				duration: 1500,
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: 0,
				duration: 1500,
				useNativeDriver: true,
			}),
		]).start(() => {
			onComplete(animation.id);
		});
	}, [animation.id, translateY, opacity, scale, onComplete]);

	return (
		<Animated.View
			style={[
				styles.container,
				{
					left: animation.position.x - 30,
					top: animation.position.y - 20,
					transform: [{ translateY }, { scale }],
					opacity,
				},
			]}
		>
			<Text style={[styles.scoreText, { color: animation.color }]}>
				+{animation.points}
			</Text>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		zIndex: 1000,
		pointerEvents: 'none',
	},
	scoreText: {
		fontSize: 20,
		fontWeight: '900',
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
		fontFamily: 'Orbitron-Black',
	},
});
