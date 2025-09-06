import React, { useState, useRef } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	StyleSheet,
	Pressable,
	Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Menu, X } from 'lucide-react-native';

interface HeaderMenuProps {
	tintColor?: string;
}

export function HeaderMenu({ tintColor = '#fff' }: HeaderMenuProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [fadeAnim] = useState(new Animated.Value(0));
	const [scaleAnim] = useState(new Animated.Value(0.8));

	const menuItems = [
		{ label: 'Leaderboard', route: '/(home)/leaderboard', icon: '🏆' },
		{ label: 'Settings', route: '/(home)/settings', icon: '⚙️' },
		{ label: 'Terms', route: '/terms', icon: '📄' },
		{ label: 'Tutorial', route: '/tutorial', icon: '🎓' },
	];

	
	const itemAnimatedValues = useRef(
		menuItems.map(() => ({
			opacity: new Animated.Value(0),
			translateY: new Animated.Value(30),
			scale: new Animated.Value(0.8),
		}))
	).current;

	const showMenu = () => {
		setIsVisible(true);

		// Start container animation
		itemAnimatedValues.forEach((item) => {
			item.opacity.setValue(0);
			item.translateY.setValue(30);
			item.scale.setValue(0.8);
		});

		
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.spring(scaleAnim, {
				toValue: 1,
				tension: 100,
				friction: 8,
				useNativeDriver: true,
			}),
		]).start(() => {
			
			const itemAnimations = itemAnimatedValues.map((item, index) =>
				Animated.parallel([
					Animated.timing(item.opacity, {
						toValue: 1,
						duration: 300,
						delay: index * 100, 
						useNativeDriver: true,
					}),
					Animated.spring(item.translateY, {
						toValue: 0,
						tension: 80,
						friction: 8,
						delay: index * 100,
						useNativeDriver: true,
					}),
					Animated.spring(item.scale, {
						toValue: 1,
						tension: 100,
						friction: 8,
						delay: index * 100,
						useNativeDriver: true,
					}),
				])
			);

			Animated.parallel(itemAnimations).start();
		});
	};

	const hideMenu = () => {
		
		const itemAnimations = itemAnimatedValues.map((item, index) =>
			Animated.parallel([
				Animated.timing(item.opacity, {
					toValue: 0,
					duration: 200,
					delay: (itemAnimatedValues.length - 1 - index) * 50, 
					useNativeDriver: true,
				}),
				Animated.timing(item.translateY, {
					toValue: 20,
					duration: 200,
					delay: (itemAnimatedValues.length - 1 - index) * 50,
					useNativeDriver: true,
				}),
				Animated.timing(item.scale, {
					toValue: 0.8,
					duration: 200,
					delay: (itemAnimatedValues.length - 1 - index) * 50,
					useNativeDriver: true,
				}),
			])
		);

		Animated.parallel([
			...itemAnimations,
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 250,
				delay: 100,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 0.8,
				duration: 250,
				delay: 100,
				useNativeDriver: true,
			}),
		]).start(() => {
			setIsVisible(false);
		});
	};

	const navigateTo = (route: string, index: number) => {
		
		Animated.sequence([
			Animated.timing(itemAnimatedValues[index].scale, {
				toValue: 0.95,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(itemAnimatedValues[index].scale, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();

		setTimeout(() => {
			hideMenu();
			setTimeout(() => {
				router.push(route as any);
			}, 100);
		}, 150);
	};

	return (
		<>
			<TouchableOpacity onPress={showMenu} style={styles.menuButton}>
				<Menu size={24} color={tintColor} />
			</TouchableOpacity>

			<Modal
				visible={isVisible}
				transparent
				animationType='none'
				onRequestClose={hideMenu}
			>
				<Pressable style={styles.overlay} onPress={hideMenu}>
					<Animated.View
						style={[
							styles.menuContainer,
							{
								opacity: fadeAnim,
								transform: [{ scale: scaleAnim }],
							},
						]}
					>
						<View style={styles.menuHeader}>
							<Text style={styles.menuTitle}>Navigation</Text>
							<TouchableOpacity onPress={hideMenu} style={styles.closeButton}>
								<X size={20} color='#666' />
							</TouchableOpacity>
						</View>

						<View style={styles.menuItems}>
							{menuItems.map((item, index) => (
								<Animated.View
									key={index}
									style={{
										opacity: itemAnimatedValues[index].opacity,
										transform: [
											{ translateY: itemAnimatedValues[index].translateY },
											{ scale: itemAnimatedValues[index].scale },
										],
									}}
								>
									<TouchableOpacity
										style={[
											styles.menuItem,
											index === menuItems.length - 1 && styles.lastMenuItem,
										]}
										onPress={() => navigateTo(item.route, index)}
									>
										<Text style={styles.menuItemIcon}>{item.icon}</Text>
										<Text style={styles.menuItemText}>{item.label}</Text>
									</TouchableOpacity>
								</Animated.View>
							))}
						</View>
					</Animated.View>
				</Pressable>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	menuButton: {
		padding: 8,
		marginRight: 8,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
		paddingTop: 80,
		paddingRight: 16,
	},
	menuContainer: {
		backgroundColor: '#fff',
		borderRadius: 12,
		minWidth: 200,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 8,
	},
	menuHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	menuTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	closeButton: {
		padding: 4,
	},
	menuItems: {
		paddingVertical: 8,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f5f5f5',
		backgroundColor: 'transparent',
	},
	lastMenuItem: {
		borderBottomWidth: 0,
	},
	menuItemIcon: {
		fontSize: 18,
		marginRight: 12,
		width: 24,
		textAlign: 'center',
	},
	menuItemText: {
		fontSize: 16,
		color: '#333',
		flex: 1,
		fontWeight: '500',
	},
});
