import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const TRANSITION = 300;

export default function CommandMenu({
	title,
	avatar,
	status = [],
	statusInterval = 4000,
	sections = [],
	theme,
	onThemeChange,
	labels,
	shortcutKey = 'k',
	id = 'command-menu',
	className = '',
	badges,
}) {
	const [isApple, setIsApple] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState(-1);
	const [statusIndex, setStatusIndex] = useState(0);
	const isTransitioning = useRef(false);
	const containerRef = useRef(null);

	const allSections = [...sections];
	const items = allSections.flatMap((section) => section.items);

	const itemsRef = useRef(items);
	itemsRef.current = items;
	const selectedRef = useRef(selected);
	selectedRef.current = selected;

	/** Geometry of the highlight that slides between items */
	const [highlight, setHighlight] = useState();
	const [highlightMoves, setHighlightMoves] = useState(false);
	const itemRefs = useRef([]);

	useLayoutEffect(() => {
		if (!isOpen || selected < 0) {
			setHighlightMoves(false);
			return;
		}
		const element = itemRefs.current[selected];
		if (!element) return;
		setHighlight((previous) => {
			setHighlightMoves(previous !== undefined);
			return {
				top: element.offsetTop,
				left: element.offsetLeft,
				width: element.offsetWidth,
				height: element.offsetHeight,
			};
		});
	}, [isOpen, selected]);

	useEffect(() => {
		setIsApple(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
	}, []);

	// Rotating status
	useEffect(() => {
		if (isOpen || status.length < 2) return;
		const interval = setInterval(() => {
			if (!document.hidden) setStatusIndex((value) => (value + 1) % status.length);
		}, statusInterval);
		return () => clearInterval(interval);
	}, [isOpen, status.length, statusInterval]);

	// Shortcut listener
	useEffect(() => {
		let timeout;
		function onKeyDown(event) {
			if (event.key !== shortcutKey || !(isApple ? event.metaKey : event.ctrlKey)) return;
			event.preventDefault();
			setIsOpen((value) => !value);
			isTransitioning.current = true;
			clearTimeout(timeout);
			timeout = setTimeout(() => (isTransitioning.current = false), TRANSITION);
		}
		window.addEventListener('keydown', onKeyDown);
		return () => {
			clearTimeout(timeout);
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [isApple, shortcutKey]);

	// Navigation & outside click
	useEffect(() => {
		if (!isOpen) return;
		setSelected(-1);

		function onKeyDown(event) {
			const count = itemsRef.current.length;
			const move = (delta) => {
				setSelected((value) => {
					if (value === -1) return delta > 0 ? 0 : count - 1;
					return (value + delta + count) % count;
				});
			};

			switch (event.key) {
				case 'ArrowUp':
				case 'k':
					event.preventDefault();
					move(-1);
					break;
				case 'ArrowDown':
				case 'j':
					event.preventDefault();
					move(1);
					break;
				case 'Enter':
					event.preventDefault();
					if (selectedRef.current >= 0) {
						itemsRef.current[selectedRef.current]?.onSelect();
					}
					break;
				case 'Escape':
					event.preventDefault();
					setIsOpen(false);
					break;
			}
		}

		function onClick(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('click', onClick);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('click', onClick);
		};
	}, [isOpen]);

	return (
		<div
			ref={containerRef}
			id={id}
			style={{ position: 'relative', display: 'inline-block' }}
			className={className}
		>
			{/* Trigger Pill */}
			<div
				className="topbar-profile-box"
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(prev => !prev);
				}}
				style={{
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					gap: '10px',
					background: 'var(--bg-card)',
					border: '1px solid var(--border-light)',
					borderRadius: 'var(--radius-lg, 12px)',
					padding: '6px 12px',
					transition: 'all 0.2s ease',
					userSelect: 'none'
				}}
			>
				{avatar}
				<div className="topbar-profile-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
					<span className="topbar-profile-name" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
						{title}
					</span>
					{badges ? badges : (
						status.length > 0 && (
							<span style={{ fontSize: '11px', color: 'var(--text-muted)', minHeight: '14px', minWidth: '80px', position: 'relative', overflow: 'hidden', display: 'block' }}>
								<span style={{ animation: 'cm-fly-in 0.4s ease-out backwards', display: 'flex', alignItems: 'center', gap: '4px' }} key={statusIndex}>
									<span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
									{status[statusIndex]}
								</span>
							</span>
						)
					)}
				</div>
				<i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
			</div>

			{/* Floating Dropdown Menu */}
			{isOpen && (
				<div
					style={{
						position: 'absolute',
						top: 'calc(100% + 6px)',
						right: 0,
						width: '280px',
						maxWidth: 'calc(100vw - 20px)',
						background: 'var(--bg-card, #ffffff)',
						border: '1px solid var(--border-light, #cbd5e1)',
						borderRadius: '16px',
						boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1))',
						padding: '8px',
						display: 'flex',
						flexDirection: 'column',
						gap: '6px',
						zIndex: 10000,
						animation: 'cm-fly-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
					}}
				>
					{allSections.map((section, secIdx) => (
						<div key={section.label || secIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
							{secIdx > 0 && section.label && <hr style={{ border: 'none', borderTop: '1px solid var(--border-light, #cbd5e1)', margin: '4px 0' }} />}
							{section.label && (
								<span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									{section.label}
								</span>
							)}
							<div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
								{section.items.map((item, itemIdx) => {
									const index = items.indexOf(item);
									const isSelected = selected === index;
									const isLogout = item.name.includes('ออกจากระบบ');
									const isLast = itemIdx === section.items.length - 1;

									return (
										<button
											key={item.name}
											ref={(node) => {
												itemRefs.current[index] = node;
											}}
											type="button"
											onMouseEnter={() => setSelected(index)}
											onClick={() => {
												item.onSelect();
												setIsOpen(false);
											}}
											style={{
												position: 'relative',
												display: 'flex',
												alignItems: 'center',
												justifyContent: item.centered ? 'center' : 'flex-start',
												gap: '10px',
												width: '100%',
												padding: '9px 8px',
												borderRadius: '6px',
												border: 'none',
												borderBottom: !isLast ? '1px solid var(--border-light)' : 'none',
												background: isSelected 
													? (isLogout ? 'rgba(239, 68, 68, 0.08)' : 'var(--primary-pale)') 
													: 'transparent',
												color: isLogout 
													? 'var(--danger, #ef4444)' 
													: (isSelected ? 'var(--primary)' : 'var(--text-primary)'),
												fontSize: '12.5px',
												fontWeight: isSelected ? 700 : 500,
												cursor: 'pointer',
												transition: 'all 0.15s ease'
											}}
										>
											<div style={{
												width: 24,
												height: 24,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												flexShrink: 0
											}}>
												{item.icon}
											</div>
											<span>{item.name}</span>
										</button>
									);
								})}
							</div>
						</div>
					))}

					{onThemeChange && (
						<ThemeToggleSwitch theme={theme} onThemeChange={onThemeChange} labels={labels} />
					)}
				</div>
			)}
		</div>
	);
}

function ThemeToggleSwitch({ theme, onThemeChange, labels }) {
	const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<hr style={{ border: 'none', borderTop: '1px solid var(--border-light, #cbd5e1)', margin: '4px 0 2px' }} />
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '6px 12px',
				background: 'var(--primary-bg)',
				borderRadius: '10px',
				border: '1px solid var(--border-light)'
			}}>
				<span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
					{labels?.theme || 'โหมดหน้าจอ'}
				</span>

				<div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
					{/* Sun Icon */}
					<span
						onClick={() => onThemeChange('light')}
						title={labels?.light || 'โหมดสว่าง'}
						style={{
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: !isDark ? '#f59e0b' : 'var(--text-muted)',
							opacity: !isDark ? 1 : 0.4,
							transition: 'all 0.2s ease'
						}}
					>
						<SunIcon />
					</span>

					{/* Switch Track */}
					<div
						onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
						role="switch"
						aria-checked={isDark}
						aria-label="Toggle between dark and light mode"
						style={{
							width: '38px',
							height: '20px',
							borderRadius: '12px',
							background: isDark ? 'var(--primary, #3b82f6)' : '#cbd5e1',
							padding: '2px',
							cursor: 'pointer',
							position: 'relative',
							display: 'inline-flex',
							alignItems: 'center',
							transition: 'background-color 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
						}}
					>
						{/* Sliding Handle */}
						<div
							style={{
								width: '16px',
								height: '16px',
								borderRadius: '50%',
								background: '#ffffff',
								boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
								transform: isDark ? 'translateX(18px)' : 'translateX(0px)',
								transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
							}}
						/>
					</div>

					{/* Moon Icon */}
					<span
						onClick={() => onThemeChange('dark')}
						title={labels?.dark || 'โหมดมืด'}
						style={{
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: isDark ? '#60a5fa' : 'var(--text-muted)',
							opacity: isDark ? 1 : 0.4,
							transition: 'all 0.2s ease'
						}}
					>
						<MoonIcon />
					</span>
				</div>
			</div>
		</div>
	);
}

function SunIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
			<circle cx="12" cy="12" r="4" />
			<path
				strokeLinecap="round"
				d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
			/>
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M21 13.2A8.5 8.5 0 1 1 10.8 3a7 7 0 0 0 10.2 10.2Z"
			/>
		</svg>
	);
}

function SystemIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
			<rect x="3" y="4" width="18" height="12" rx="2" />
			<path strokeLinecap="round" d="M9 20h6m-3-4v4" />
		</svg>
	);
}
