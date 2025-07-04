import React, { useEffect, useRef } from 'react';
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Platform,
} from 'react-native';
import { Player, GameState } from '@/interfaces/game';
import { GameMode } from '@/hooks/useGameLogic';
import { RotateCcw, Trophy, Bot, User, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface GameModalProps {
	visible: boolean;
	gameState: GameState;
	winner: Player | null;
	gameMode: GameMode;
	winType?: 'regular' | 'king';
	onPlayAgain: () => void;
	onClose: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
	visible,
	gameState,
	winner,
	gameMode,
	winType = 'regular',
	onPlayAgain,
	onClose,
}) => {
	const scaleAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (visible) {
			if (Platform.OS !== 'web') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			}

			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
				tension: 50,
				friction: 7,
			}).start();
		} else {
			scaleAnim.setValue(0);
		}
	}, [visible, scaleAnim]);

	const getTitle = () => {
		if (gameState === 'won' && winner) {
			if (winType === 'king') {
				if (gameMode.type === 'ai') {
					return winner === 'red'
						? 'AI Achieves Ultimate Victory!'
						: 'You Are The Ultimate Winner!';
				}
				return `${
					winner.charAt(0).toUpperCase() + winner.slice(1)
				} Achieves Ultimate Victory!`;
			} else {
				if (gameMode.type === 'ai') {
					return winner === 'red' ? 'AI Wins!' : 'You Win!';
				}
				return `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!`;
			}
		}
		return "It's a Draw!";
	};

	const getSubtitle = () => {
		if (gameState === 'won') {
			if (winType === 'king') {
				return winner === 'red'
					? 'Three Kings United! 👑'
					: 'Three Kings United! 👑';
			} else {
				if (gameMode.type === 'ai') {
					return winner === 'red'
						? 'Better luck next time! 🤖'
						: 'Congratulations! 🎉';
				}
				return 'Congratulations! 🎉';
			}
		}
		return 'Good game! 🤝';
	};

	const getWinnerColor = () => {
		if (winner === 'red') return winType === 'king' ? '#dc2626' : '#ef4444';
		if (winner === 'yellow') return winType === 'king' ? '#d97706' : '#fbbf24';
		return '#6b7280';
	};

	const getIcon = () => {
		if (gameState === 'draw') {
			return <Text style={styles.drawEmoji}>🤝</Text>;
		}

		if (winType === 'king') {
			return <Crown size={48} color={getWinnerColor()} />;
		}

		if (gameMode.type === 'ai') {
			return winner === 'red' ? (
				<Bot size={48} color={getWinnerColor()} />
			) : (
				<User size={48} color={getWinnerColor()} />
			);
		}

		return <Trophy size={48} color={getWinnerColor()} />;
	};

	return (
		<Modal
			transparent
			visible={visible}
			animationType='fade'
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<Animated.View
					style={[
						styles.modal,
						{
							transform: [{ scale: scaleAnim }],
						},
					]}
				>
					<View style={styles.iconContainer}>{getIcon()}</View>

					<Text style={[styles.title, { color: getWinnerColor() }]}>
						{getTitle()}
					</Text>
					<Text style={styles.subtitle}>{getSubtitle()}</Text>

					{winType === 'king' && (
						<View style={styles.kingBadge}>
							<Crown size={20} color='#ffffff' />
							<Text style={styles.kingBadgeText}>Ultimate Victory</Text>
						</View>
					)}

					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[styles.button, styles.playAgainButton]}
							onPress={onPlayAgain}
							activeOpacity={0.8}
						>
							<RotateCcw size={20} color='#ffffff' />
							<Text style={styles.playAgainText}>Play Again</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modal: {
		backgroundColor: '#ffffff',
		borderRadius: 20,
		padding: 32,
		alignItems: 'center',
		marginHorizontal: 40,
		minWidth: 280,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 20,
	},
	iconContainer: {
		marginBottom: 20,
	},
	drawEmoji: {
		fontSize: 48,
	},
	title: {
		fontSize: 24,
		fontWeight: '800',
		marginBottom: 8,
		textAlign: 'center',
		fontFamily: 'Orbitron-Black',
	},
	subtitle: {
		fontSize: 16,
		color: '#6b7280',
		marginBottom: 16,
		textAlign: 'center',
		fontFamily: 'Orbitron-Regular',
	},
	kingBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fbbf24',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginBottom: 24,
	},
	kingBadgeText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '700',
		marginLeft: 6,
		fontFamily: 'Orbitron-Bold',
	},
	buttonContainer: {
		width: '100%',
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 12,
		marginBottom: 12,
	},
	playAgainButton: {
		backgroundColor: '#4f46e5',
		shadowColor: '#4f46e5',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	playAgainText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '700',
		marginLeft: 8,
		fontFamily: 'Orbitron-Bold',
	},
});
