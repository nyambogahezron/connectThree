import React, { useState, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	SafeAreaView,
	Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { Check, X, Shield, FileText, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const termsContent = `
CONNECT 3 - TERMS AND CONDITIONS

Last updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By downloading, installing, or using Connect 3 ("the Game"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, do not use the Game.

2. GAME DESCRIPTION
Connect 3 is a strategic puzzle game where players attempt to connect three pieces in a row, column, or diagonal on a game board.

3. USER CONDUCT
You agree to use the Game in accordance with all applicable laws and regulations. You will not:
• Use the Game for any unlawful purpose
• Attempt to hack, modify, or reverse engineer the Game
• Share your account credentials with others
• Engage in any behavior that disrupts other players' experience

4. PRIVACY POLICY
Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use the Game.

5. INTELLECTUAL PROPERTY
The Game and all its content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.

6. GAME AVAILABILITY
We strive to keep the Game available at all times, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue the Game at any time.

7. IN-APP PURCHASES
The Game may offer in-app purchases. All purchases are final and non-refundable unless required by applicable law.

8. LIMITATION OF LIABILITY
To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Game.

9. UPDATES TO TERMS
We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms in the Game.

10. CONTACT INFORMATION
If you have any questions about these Terms, please contact us at support@connect3game.com.

11. GOVERNING LAW
These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction].

12. SEVERABILITY
If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.

By clicking "Accept", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
`;

export default function TermsScreen() {
	const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
	const [isAccepted, setIsAccepted] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);

	const acceptButtonScale = useSharedValue(1);
	const acceptButtonOpacity = useSharedValue(0.5);
	const checkmarkScale = useSharedValue(0);

	const handleScroll = (event: any) => {
		const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
		const isScrolledToBottom =
			layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

		if (isScrolledToBottom && !hasScrolledToBottom) {
			setHasScrolledToBottom(true);
			acceptButtonOpacity.value = withTiming(1, { duration: 500 });
			acceptButtonScale.value = withSpring(1.05, { damping: 15 });
			setTimeout(() => {
				acceptButtonScale.value = withSpring(1, { damping: 15 });
			}, 200);
		}
	};

	const handleAccept = () => {
		if (!hasScrolledToBottom) return;

		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}

		setIsAccepted(true);
		checkmarkScale.value = withSpring(1, { damping: 10, stiffness: 100 });

		setTimeout(() => {
			router.replace('/tutorial');
		}, 1000);
	};

	const handleDecline = () => {
		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.back();
	};

	const acceptButtonAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: acceptButtonScale.value }],
		opacity: acceptButtonOpacity.value,
	}));

	const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: checkmarkScale.value }],
	}));

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient colors={['#1e293b', '#334155']} style={styles.gradient}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={handleDecline}>
						<ArrowLeft size={24} color='#ffffff' />
					</TouchableOpacity>
					<View style={styles.headerContent}>
						<Shield size={32} color='#4f46e5' />
						<Text style={styles.headerTitle}>Terms & Conditions</Text>
					</View>
				</View>

				{/* Content */}
				<View style={styles.contentContainer}>
					<ScrollView
						ref={scrollViewRef}
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						showsVerticalScrollIndicator={true}
					>
						<View style={styles.termsContainer}>
							<View style={styles.iconHeader}>
								<FileText size={48} color='#4f46e5' />
								<Text style={styles.termsTitle}>Legal Agreement</Text>
								<Text style={styles.termsSubtitle}>
									Please read carefully before using Connect 3
								</Text>
							</View>

							<Text style={styles.termsText}>{termsContent}</Text>

							{!hasScrolledToBottom && (
								<View style={styles.scrollHint}>
									<Text style={styles.scrollHintText}>
										Scroll to bottom to continue
									</Text>
								</View>
							)}
						</View>
					</ScrollView>
				</View>

				{/* Action Buttons */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.declineButton}
						onPress={handleDecline}
					>
						<X size={20} color='#ef4444' />
						<Text style={styles.declineButtonText}>Decline</Text>
					</TouchableOpacity>

					<Animated.View style={acceptButtonAnimatedStyle}>
						<TouchableOpacity
							style={[
								styles.acceptButton,
								!hasScrolledToBottom && styles.acceptButtonDisabled,
								isAccepted && styles.acceptButtonAccepted,
							]}
							onPress={handleAccept}
							disabled={!hasScrolledToBottom || isAccepted}
						>
							{isAccepted ? (
								<Animated.View
									style={[styles.checkmarkContainer, checkmarkAnimatedStyle]}
								>
									<Check size={20} color='#ffffff' />
								</Animated.View>
							) : (
								<Check size={20} color='#ffffff' />
							)}
							<Text style={styles.acceptButtonText}>
								{isAccepted ? 'Accepted!' : 'Accept & Continue'}
							</Text>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 10,
	},
	backButton: {
		padding: 8,
		marginRight: 16,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	headerTitle: {
		fontSize: 20,
		fontFamily: 'Orbitron-Bold',
		color: '#ffffff',
		marginLeft: 12,
	},
	contentContainer: {
		flex: 1,
		marginHorizontal: 20,
		marginBottom: 20,
	},
	scrollView: {
		flex: 1,
		backgroundColor: 'rgba(255,255,255,0.05)',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
	},
	scrollContent: {
		padding: 20,
	},
	termsContainer: {
		paddingBottom: 20,
	},
	iconHeader: {
		alignItems: 'center',
		marginBottom: 30,
	},
	termsTitle: {
		fontSize: 24,
		fontFamily: 'Orbitron-Bold',
		color: '#ffffff',
		marginTop: 16,
		marginBottom: 8,
	},
	termsSubtitle: {
		fontSize: 14,
		fontFamily: 'Orbitron-Regular',
		color: '#94a3b8',
		textAlign: 'center',
	},
	termsText: {
		fontSize: 14,
		fontFamily: 'Orbitron-Regular',
		color: '#e2e8f0',
		lineHeight: 22,
		textAlign: 'left',
	},
	scrollHint: {
		alignItems: 'center',
		marginTop: 20,
		padding: 16,
		backgroundColor: 'rgba(79, 70, 229, 0.1)',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(79, 70, 229, 0.3)',
	},
	scrollHintText: {
		fontSize: 12,
		fontFamily: 'Orbitron-Regular',
		color: '#4f46e5',
		textAlign: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		paddingBottom: 20,
		gap: 12,
	},
	declineButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		backgroundColor: 'rgba(239, 68, 68, 0.1)',
		borderRadius: 12,
		borderWidth: 2,
		borderColor: 'rgba(239, 68, 68, 0.3)',
	},
	declineButtonText: {
		fontSize: 16,
		fontFamily: 'Orbitron-Bold',
		color: '#ef4444',
		marginLeft: 8,
	},
	acceptButton: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		backgroundColor: '#4f46e5',
		borderRadius: 12,
		shadowColor: '#4f46e5',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	acceptButtonDisabled: {
		backgroundColor: '#64748b',
		shadowOpacity: 0,
	},
	acceptButtonAccepted: {
		backgroundColor: '#059669',
	},
	acceptButtonText: {
		fontSize: 16,
		fontFamily: 'Orbitron-Bold',
		color: '#ffffff',
		marginLeft: 8,
	},
	checkmarkContainer: {
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 10,
		padding: 2,
	},
});
